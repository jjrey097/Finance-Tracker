<script setup>
import { onMounted } from 'vue'
import { useFinanceStore } from './stores/finance'

const store = useFinanceStore()

onMounted(async () => {
  try {
    await Promise.all([store.fetchTransactions(), store.fetchAnnualSummary()])
  } catch (err) {
    console.error('Failed to load initial data:', err)
  }
})
</script>

<template>
  <div data-theme="light" class="min-h-screen bg-base-100">
    <div class="navbar bg-base-200 shadow">
      <div class="flex-1 px-2 lg:px-0">
        <span class="text-xl font-bold text-primary">Finance Tracker</span>
      </div>
      <div class="flex-none gap-2 px-2">
        <RouterLink to="/" class="btn btn-ghost btn-sm">Dashboard</RouterLink>
        <RouterLink to="/transactions" class="btn btn-ghost btn-sm">Transactions</RouterLink>
      </div>
    </div>
    <main class="max-w-5xl mx-auto p-6">
      <RouterView />
    </main>
  </div>
</template>

