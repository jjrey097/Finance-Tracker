export function fmt(n: number): string {
  return '$' + (n ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function remainingClass(val: number): string {
  return val >= 0 ? 'text-green-700' : 'text-red-600'
}

export const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const EXPENSE_CATEGORIES = [
  'gas', 'gym', 'groceries', 'haircut', 'subscriptions', 'rent',
  'electricity', 'renters insurance', 'other', 'car note', 'car insurance',
  'car wash', 'phone bill', 'student loans', 'going out', 'internet', 'pet insurance',
]
