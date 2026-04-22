export type TransactionType = 'Income' | 'Savings' | 'Expense'

export interface SerializedTransaction {
  id: number
  userId: string
  date: string
  transactionType: string
  expenseCategory: string | null
  amount: number
  paymentMethod: string
  note: string | null
}

export interface MonthSummary {
  month: number
  monthName: string
  income: number
  expenses: number
  savings: number
  remaining: number
  expenseBreakdown: { category: string; total: number }[]
}

export interface AnnualSummary {
  year: number
  months: MonthSummary[]
  totals: {
    income: number
    expenses: number
    savings: number
    remaining: number
  }
}

export interface TransactionPayload {
  date: string
  transactionType: string
  expenseCategory: string | null
  amount: number
  paymentMethod: string
  note: string | null
}
