import { defineStore } from 'pinia'
import axios from 'axios'

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    transactions: [],
    annualSummary: null,
    currentYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1,
    selectedYear: new Date().getFullYear()
  }),

  getters: {
    // Filter transactions by selected month/year
    monthTransactions: (state) => {
      return state.transactions.filter(tx => {
        const txDate = new Date(tx.date)
        return txDate.getMonth() + 1 === state.selectedMonth && 
               txDate.getFullYear() === state.selectedYear
      })
    },
    
    // Group transactions by payment method with totals
    paymentMethodBreakdown: (state) => {
      if (state.monthTransactions.length === 0) return []
      
      const breakdown = {}
      state.monthTransactions.forEach(tx => {
        if (tx.transactionType === 'Expense' && tx.paymentMethod) {
          const method = tx.paymentMethod.trim().toUpperCase()
          if (!breakdown[method]) {
            breakdown[method] = { method, total: 0, transactions: [] }
          }
          breakdown[method].total += tx.amount
          breakdown[method].transactions.push(tx)
        }
      })
      
      return Object.values(breakdown).sort((a, b) => b.total - a.total)
    },

    // Calculate net amount for the month (income minus expenses and savings)
    monthNetAmount: (state) => {
      if (state.monthTransactions.length === 0) return 0
      
      return state.monthTransactions.reduce((sum, tx) => {
        if (tx.transactionType === 'Income') {
          return sum + tx.amount
        } else if (tx.transactionType === 'Expense' || tx.transactionType === 'Savings') {
          return sum - tx.amount
        }
        return sum
      }, 0)
    }
  },

  actions: {
    async fetchTransactions() {
      const { data } = await axios.get('/api/transactions')
      this.transactions = data
    },

    async addTransaction(tx) {
      await axios.post('/api/transactions', tx)
      await Promise.all([this.fetchTransactions(), this.fetchAnnualSummary()])
    },

    async updateTransaction(id, tx) {
      await axios.put(`/api/transactions/${id}`, tx)
      await Promise.all([this.fetchTransactions(), this.fetchAnnualSummary()])
    },

    async deleteTransaction(id) {
      await axios.delete(`/api/transactions/${id}`)
      await Promise.all([this.fetchTransactions(), this.fetchAnnualSummary()])
    },

    async fetchAnnualSummary(year) {
      const y = year || this.currentYear
      const { data } = await axios.get(`/api/transactions/annual-summary?year=${y}`)
      this.annualSummary = data
    },

    setSelectedMonth(month, year) {
      this.selectedMonth = month
      this.selectedYear = year
    }
  }
})
