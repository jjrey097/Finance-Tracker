<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useFinanceStore } from '../stores/finance'

const store = useFinanceStore()

const monthNames = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const EXPENSE_CATEGORIES = [
  'gas', 'gym', 'groceries', 'haircut', 'subscriptions', 'rent',
  'electricity', 'renters insurance', 'other', 'car note', 'car insurance',
  'car wash', 'phone bill', 'student loans', 'going out', 'internet', 'pet insurance'
]

const currentYear = new Date().getFullYear()
const yearOptions = computed(() => {
  const years = []
  for (let y = currentYear; y >= currentYear - 4; y--) years.push(y)
  return years
})

const blankForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  transactionType: 'Expense',
  expenseCategory: '',
  amount: '',
  paymentMethod: '',
  note: ''
})

const form = ref(blankForm())
const editingId = ref(null)
const error = ref('')
const loading = ref(false)
const selectedPaymentMethod = ref(null)

const isEditing = computed(() => editingId.value !== null)
const showCategory = computed(() => form.value.transactionType === 'Expense')

// Get transactions for selected month
const displayTransactions = computed(() => {
  if (selectedPaymentMethod.value) {
    return store.monthTransactions.filter(tx => 
      tx.paymentMethod.trim().toUpperCase() === selectedPaymentMethod.value
    )
  }
  return store.monthTransactions
})

onMounted(() => {
  store.fetchTransactions()
})

// Sync month selection with store
watch([() => store.selectedMonth, () => store.selectedYear], () => {
  // Transactions will auto-update via computed properties
})

function startEdit(tx) {
  editingId.value = tx.id
  form.value = {
    date: tx.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    transactionType: tx.transactionType,
    expenseCategory: tx.expenseCategory ?? '',
    amount: tx.amount,
    paymentMethod: tx.paymentMethod,
    note: tx.note ?? ''
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  editingId.value = null
  form.value = blankForm()
  error.value = ''
}

function validate() {
  if (!form.value.transactionType) return 'Transaction Type is required.'
  if (!form.value.date) return 'Date is required.'
  if (!form.value.amount || parseFloat(form.value.amount) <= 0) return 'Amount must be greater than zero.'
  if (form.value.transactionType === 'Expense' && !form.value.paymentMethod.trim())
    return 'Payment Method is required for Expense transactions.'
  if (form.value.transactionType === 'Expense' && !form.value.expenseCategory)
    return 'Expense Category is required for Expense transactions.'
  return ''
}

async function submit() {
  error.value = validate()
  if (error.value) return

  loading.value = true
  try {
    const payload = {
      date: form.value.date,
      transactionType: form.value.transactionType,
      expenseCategory: form.value.transactionType === 'Expense' ? form.value.expenseCategory : null,
      amount: parseFloat(form.value.amount),
      paymentMethod: form.value.transactionType === 'Expense' ? form.value.paymentMethod.trim().toUpperCase() : '',
      note: form.value.note.trim() || null
    }

    if (isEditing.value) {
      await store.updateTransaction(editingId.value, payload)
    } else {
      await store.addTransaction(payload)
    }

    editingId.value = null
    form.value = blankForm()
  } catch (err) {
    error.value = err.response?.data || err.message || 'Failed to save transaction.'
  } finally {
    loading.value = false
  }
}

async function remove(id) {
  if (editingId.value === id) cancelEdit()
  await store.deleteTransaction(id)
}

function typeLabel(type) {
  return type === 'Income' ? 'Income' : type === 'Savings' ? 'Savings' : 'Expense'
}

function typeColor(type) {
  if (type === 'Income') return 'text-success'
  if (type === 'Savings') return 'text-info'
  return 'text-error'
}

function typeSign(type) {
  return type === 'Expense' ? '-' : '+'
}

function fmt(n) {
  return '$' + (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<template>
  <div>
    <!-- Header with month/year selector -->
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-3xl font-bold">Transactions</h1>

      <div class="flex items-center gap-3">
        <select v-model.number="store.selectedYear"
                class="select select-bordered select-sm">
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>

        <select v-model.number="store.selectedMonth"
                class="select select-bordered select-sm">
          <option v-for="n in 12" :key="n" :value="n">{{ monthNames[n] }}</option>
        </select>
      </div>
    </div>

    <!-- Add / Edit Form -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="card-title text-xl">
          {{ isEditing ? 'Edit Transaction' : 'Add New Transaction' }}
        </h2>

        <div v-if="error" class="alert alert-error mb-4">
          <span>{{ error }}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- Date -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Date *</span>
            </label>
            <input v-model="form.date" type="date"
                   class="input input-bordered w-full" />
          </div>

          <!-- Transaction Type -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Transaction Type *</span>
            </label>
            <select v-model="form.transactionType"
                    class="select select-bordered w-full">
              <option value="Income">Income</option>
              <option value="Savings">Savings</option>
              <option value="Expense">Expense</option>
            </select>
          </div>

          <!-- Expense Category (only when type = Expense) -->
          <div v-if="showCategory" class="form-control">
            <label class="label">
              <span class="label-text">Expense Category *</span>
            </label>
            <input v-model="form.expenseCategory"
                   list="expense-category-suggestions"
                   placeholder="e.g. rent, groceries, restaurant"
                   class="input input-bordered w-full" />
            <datalist id="expense-category-suggestions">
              <option v-for="cat in EXPENSE_CATEGORIES" :key="cat" :value="cat" />
            </datalist>
          </div>

          <!-- Amount -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Amount ($) *</span>
            </label>
            <input v-model="form.amount" type="number" min="0.01" step="0.01" placeholder="0.00"
                   class="input input-bordered w-full" />
          </div>

          <!-- Payment Method -->
          <div v-if="form.transactionType === 'Expense'" class="form-control">
            <label class="label">
              <span class="label-text">Payment Method *</span>
            </label>
            <input v-model="form.paymentMethod" placeholder="e.g. CHASE, AMEX, Cash"
                   class="input input-bordered w-full" />
          </div>

          <!-- Note -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Note</span>
            </label>
            <input v-model="form.note" placeholder="Optional note"
                   class="input input-bordered w-full" />
          </div>
        </div>

        <div class="card-actions justify-start mt-6 gap-3">
          <button @click="submit" :disabled="loading"
                  class="btn btn-primary flex-1">
            {{ loading ? 'Saving...' : isEditing ? 'Update Transaction' : 'Add Transaction' }}
          </button>
          <button v-if="isEditing" @click="cancelEdit"
                  class="btn btn-outline">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Payment Method Filter -->
    <div v-if="store.paymentMethodBreakdown.length > 0" class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h3 class="card-title text-lg">Filter by Payment Method</h3>
        <div class="flex flex-wrap gap-2">
          <button @click="selectedPaymentMethod = null"
                  :class="['btn btn-sm', selectedPaymentMethod === null ? 'btn-primary' : 'btn-outline']">
            All Transactions ({{ fmt(store.monthNetAmount) }})
          </button>
          <button v-for="method in store.paymentMethodBreakdown" :key="method.method"
                  @click="selectedPaymentMethod = method.method"
                  :class="['btn btn-sm', selectedPaymentMethod === method.method ? 'btn-primary' : 'btn-outline']">
            {{ method.method }} ({{ fmt(method.total) }})
          </button>
        </div>
      </div>
    </div>

    <!-- Transaction List -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-lg">
          {{ monthNames[store.selectedMonth] }} {{ store.selectedYear }} Transactions
        </h2>

        <div v-if="displayTransactions.length === 0" class="text-center text-base-content/50 py-8">
          No transactions found for this period.
          <RouterLink to="/" class="link link-primary">Go to Dashboard</RouterLink>
        </div>

        <div v-for="tx in displayTransactions" :key="tx.id"
             :class="['flex justify-between items-start p-4 border-b last:border-0 hover:bg-base-200 rounded transition',
                      editingId === tx.id ? 'bg-warning/20 border-l-4 border-warning' : '']">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span :class="['badge',
                             tx.transactionType === 'Income'  ? 'badge-success' :
                             tx.transactionType === 'Savings' ? 'badge-info' :
                                                                 'badge-error']">
                {{ typeLabel(tx.transactionType) }}
              </span>
              <span v-if="tx.expenseCategory" class="text-sm font-medium capitalize">
                {{ tx.expenseCategory }}
              </span>
              <span class="text-xs opacity-50">{{ tx.date?.slice(0, 10) }}</span>
              <span class="text-xs opacity-75 italic">{{ tx.paymentMethod }}</span>
            </div>
            <p v-if="tx.note" class="text-xs opacity-70 mt-1 truncate">{{ tx.note }}</p>
          </div>

          <div class="flex items-center gap-2 ml-4 shrink-0">
            <span :class="['font-bold text-lg', typeColor(tx.transactionType)]">
              {{ typeSign(tx.transactionType) }}{{ fmt(tx.amount) }}
            </span>
            <button @click="startEdit(tx)"
                    class="btn btn-ghost btn-sm btn-square">
              ✏️
            </button>
            <button @click="remove(tx.id)"
                    class="btn btn-ghost btn-sm btn-square text-error">
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
