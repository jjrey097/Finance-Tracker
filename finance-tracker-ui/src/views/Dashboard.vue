<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useFinanceStore } from '../stores/finance'

const store = useFinanceStore()

const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const selectedMonth = ref(0)  // 0 = All Months; 1-12 = specific month

const monthNames = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Show last 5 years up to and including the current year
const yearOptions = computed(() => {
  const years = []
  for (let y = currentYear; y >= currentYear - 4; y--) years.push(y)
  return years
})

onMounted(() => store.fetchAnnualSummary(selectedYear.value))

watch(selectedYear, (y) => {
  selectedMonth.value = 0  // reset month filter when switching years
  store.fetchAnnualSummary(y)
})

watch([selectedMonth, selectedYear], ([month, year]) => {
  if (month !== 0) {  // Only sync when a specific month is selected
    store.setSelectedMonth(month, year)
  }
})

// Rows shown in the summary table
const tableRows = computed(() => {
  const months = store.annualSummary?.months ?? []
  if (selectedMonth.value === 0) return months
  return months.filter(m => m.month === selectedMonth.value)
})

// Footer totals row
const totals = computed(() => {
  if (!store.annualSummary) return null
  if (selectedMonth.value === 0) return store.annualSummary.totals
  const m = tableRows.value[0]
  if (!m) return null
  return { income: m.income, expenses: m.expenses, savings: m.savings, remaining: m.remaining }
})

// Months with expense data (for breakdown section)
const breakdownMonths = computed(() =>
  tableRows.value.filter(m => m.expenseBreakdown && m.expenseBreakdown.length > 0)
)

function fmt(n) {
  return '$' + (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function remainingClass(val) {
  return val >= 0 ? 'text-green-700' : 'text-red-600'
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-3xl font-bold">Dashboard</h1>

      <!-- Year + Month Selectors -->
      <div class="flex items-center gap-3">
        <select v-model.number="selectedYear"
                class="select select-bordered select-sm">
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>

        <select v-model.number="selectedMonth"
                class="select select-bordered select-sm">
          <option :value="0">All Months</option>
          <option v-for="n in 12" :key="n" :value="n">{{ monthNames[n] }}</option>
        </select>
      </div>
    </div>

    <!-- Summary Stats Cards -->
    <div v-if="totals" class="grid grid-cols-4 gap-4 mb-8">
      <div class="stat bg-base-200 rounded-lg p-4">
        <div class="stat-title text-sm">Income</div>
        <div class="stat-value text-2xl text-success">{{ fmt(totals.income) }}</div>
      </div>
      <div class="stat bg-base-200 rounded-lg p-4">
        <div class="stat-title text-sm">Expenses</div>
        <div class="stat-value text-2xl text-error">{{ fmt(totals.expenses) }}</div>
      </div>
      <div class="stat bg-base-200 rounded-lg p-4">
        <div class="stat-title text-sm">Savings</div>
        <div class="stat-value text-2xl text-info">{{ fmt(totals.savings) }}</div>
      </div>
      <div :class="['stat', 'rounded-lg', 'p-4', 'bg-base-200', remainingClass(totals.remaining)]">
        <div class="stat-title text-sm">Remaining</div>
        <div class="stat-value text-2xl">{{ fmt(totals.remaining) }}</div>
      </div>
    </div>

    <!-- Summary Table -->
    <div class="card bg-base-100 shadow-xl mb-8" v-if="store.annualSummary">
      <div class="card-body">
        <h2 class="card-title text-xl">
          {{ selectedYear }} — {{ selectedMonth === 0 ? 'All Months' : monthNames[selectedMonth] }}
        </h2>

        <div class="overflow-x-auto">
          <table class="table table-sm w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left">Month</th>
                <th class="text-right">Income</th>
                <th class="text-right">Expenses</th>
                <th class="text-right">Savings</th>
                <th class="text-right">Remaining</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tableRows" :key="row.month" class="hover:bg-base-200">
                <td class="text-left font-medium">{{ row.monthName }}</td>
                <td class="text-right text-success font-medium">{{ fmt(row.income) }}</td>
                <td class="text-right text-error font-medium">{{ fmt(row.expenses) }}</td>
                <td class="text-right text-info font-medium">{{ fmt(row.savings) }}</td>
                <td class="text-right font-semibold" :class="remainingClass(row.remaining)">
                  {{ fmt(row.remaining) }}
                </td>
              </tr>

              <!-- Totals row -->
              <tr v-if="totals" class="bg-base-300 font-bold border-t-2">
                <td class="text-left uppercase text-xs tracking-wide">Total</td>
                <td class="text-right text-success">{{ fmt(totals.income) }}</td>
                <td class="text-right text-error">{{ fmt(totals.expenses) }}</td>
                <td class="text-right text-info">{{ fmt(totals.savings) }}</td>
                <td class="text-right" :class="remainingClass(totals.remaining)">
                  {{ fmt(totals.remaining) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else class="card bg-base-100 shadow-xl mb-8">
      <div class="card-body text-center text-base-content/50">
        Loading summary...
      </div>
    </div>

    <!-- Monthly Expense Breakdown (specific month only) -->
    <div v-if="selectedMonth !== 0 && breakdownMonths.length > 0">
      <h2 class="text-2xl font-semibold mb-4">
        {{ monthNames[selectedMonth] }} {{ selectedYear }} — Expense Breakdown
      </h2>

      <div v-for="m in breakdownMonths" :key="m.month" class="card bg-base-100 shadow-xl mb-4">
        <div class="card-body">
          <div class="flex items-center justify-between">
            <h3 class="card-title">{{ m.monthName }}</h3>
            <span class="text-sm badge badge-error">{{ fmt(m.expenses) }}</span>
          </div>
          <div class="divider my-2"></div>
          <ul class="space-y-2">
            <li v-for="item in m.expenseBreakdown" :key="item.category"
                class="flex justify-between items-center p-2 hover:bg-base-200 rounded">
              <span class="capitalize">{{ item.category }}</span>
              <span class="font-medium">{{ fmt(item.total) }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- No expense data for selected month -->
    <div v-else-if="selectedMonth !== 0 && store.annualSummary && breakdownMonths.length === 0"
         class="card bg-base-200 shadow-xl">
      <div class="card-body text-center">
        <p class="text-base-content/70">No expense transactions recorded for {{ monthNames[selectedMonth] }} {{ selectedYear }}.</p>
        <RouterLink to="/transactions" class="link link-primary mt-2">Add transactions to see a breakdown here</RouterLink>
      </div>
    </div>
  </div>
</template>
