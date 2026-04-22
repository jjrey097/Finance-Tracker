'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addTransaction, deleteTransaction, updateTransaction } from '@/lib/actions'
import { SerializedTransaction } from '@/lib/types'
import { EXPENSE_CATEGORIES, fmt, MONTH_NAMES } from '@/lib/utils'

interface Props {
  transactions: SerializedTransaction[]
  month: number
  year: number
}

const blankForm = () => ({
  date:            new Date().toISOString().slice(0, 10),
  transactionType: 'Expense',
  expenseCategory: '',
  amount:          '',
  paymentMethod:   '',
  note:            '',
})

export default function TransactionsClient({ transactions, month, year }: Props) {
  const router                                          = useRouter()
  const [isPending, startTransition]                    = useTransition()
  const [form, setForm]                                 = useState(blankForm)
  const [editingId, setEditingId]                       = useState<number | null>(null)
  const [error, setError]                               = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  // ── derived data ──────────────────────────────────────────────────────────

  const monthTransactions = useMemo(
    () => transactions.filter((tx) => {
      const d = new Date(tx.date)
      return d.getMonth() + 1 === month && d.getFullYear() === year
    }),
    [transactions, month, year]
  )

  const displayTransactions = useMemo(
    () => selectedPaymentMethod
      ? monthTransactions.filter((tx) => tx.paymentMethod?.trim().toUpperCase() === selectedPaymentMethod)
      : monthTransactions,
    [monthTransactions, selectedPaymentMethod]
  )

  const paymentMethodBreakdown = useMemo(() => {
    const map: Record<string, { method: string; total: number }> = {}
    monthTransactions.forEach((tx) => {
      if (tx.transactionType === 'Expense' && tx.paymentMethod) {
        const key = tx.paymentMethod.trim().toUpperCase()
        if (!map[key]) map[key] = { method: key, total: 0 }
        map[key].total += tx.amount
      }
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [monthTransactions])

  const monthNetAmount = useMemo(
    () => monthTransactions.reduce((sum, tx) => {
      if (tx.transactionType === 'Income') return sum + tx.amount
      return sum - tx.amount
    }, 0),
    [monthTransactions]
  )

  // ── helpers ───────────────────────────────────────────────────────────────

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function navigate(newMonth: number, newYear: number) {
    router.push(`/transactions?month=${newMonth}&year=${newYear}`)
    setSelectedPaymentMethod(null)
  }

  function startEdit(tx: SerializedTransaction) {
    setEditingId(tx.id)
    setForm({
      date:            tx.date.slice(0, 10),
      transactionType: tx.transactionType,
      expenseCategory: tx.expenseCategory ?? '',
      amount:          String(tx.amount),
      paymentMethod:   tx.paymentMethod,
      note:            tx.note ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(blankForm())
    setError('')
  }

  function validate(): string {
    if (!form.transactionType)                                                    return 'Transaction type is required.'
    if (!form.date)                                                               return 'Date is required.'
    if (!form.amount || parseFloat(form.amount) <= 0)                            return 'Amount must be greater than zero.'
    if (form.transactionType === 'Expense' && !form.paymentMethod.trim())        return 'Payment method is required for expenses.'
    if (form.transactionType === 'Expense' && !form.expenseCategory)             return 'Expense category is required.'
    return ''
  }

  function submit() {
    const err = validate()
    if (err) { setError(err); return }
    setError('')

    const payload = {
      date:            form.date,
      transactionType: form.transactionType,
      expenseCategory: form.transactionType === 'Expense' ? form.expenseCategory : null,
      amount:          parseFloat(form.amount),
      paymentMethod:   form.transactionType === 'Expense' ? form.paymentMethod.trim().toUpperCase() : '',
      note:            form.note.trim() || null,
    }

    startTransition(async () => {
      try {
        if (editingId !== null) {
          await updateTransaction(editingId, payload)
        } else {
          await addTransaction(payload)
        }
        setEditingId(null)
        setForm(blankForm())
      } catch {
        setError('Failed to save transaction.')
      }
    })
  }

  function remove(id: number) {
    if (editingId === id) cancelEdit()
    startTransition(async () => { await deleteTransaction(id) })
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => navigate(month, parseInt(e.target.value))}
            className="select select-bordered select-sm"
          >
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={month}
            onChange={(e) => navigate(parseInt(e.target.value), year)}
            className="select select-bordered select-sm"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{MONTH_NAMES[m]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Add / Edit Form */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title text-xl">
            {editingId !== null ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>

          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div className="form-control">
              <label className="label"><span className="label-text">Date *</span></label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            {/* Type */}
            <div className="form-control">
              <label className="label"><span className="label-text">Transaction Type *</span></label>
              <select
                value={form.transactionType}
                onChange={(e) => set('transactionType', e.target.value)}
                className="select select-bordered w-full"
              >
                <option value="Income">Income</option>
                <option value="Savings">Savings</option>
                <option value="Expense">Expense</option>
              </select>
            </div>

            {/* Category */}
            {form.transactionType === 'Expense' && (
              <div className="form-control">
                <label className="label"><span className="label-text">Expense Category *</span></label>
                <input
                  list="expense-categories"
                  value={form.expenseCategory}
                  onChange={(e) => set('expenseCategory', e.target.value)}
                  placeholder="e.g. rent, groceries"
                  className="input input-bordered w-full"
                />
                <datalist id="expense-categories">
                  {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>
            )}

            {/* Amount */}
            <div className="form-control">
              <label className="label"><span className="label-text">Amount ($) *</span></label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => set('amount', e.target.value)}
                className="input input-bordered w-full"
              />
            </div>

            {/* Payment Method */}
            {form.transactionType === 'Expense' && (
              <div className="form-control">
                <label className="label"><span className="label-text">Payment Method *</span></label>
                <input
                  value={form.paymentMethod}
                  onChange={(e) => set('paymentMethod', e.target.value)}
                  placeholder="e.g. CHASE, AMEX, Cash"
                  className="input input-bordered w-full"
                />
              </div>
            )}

            {/* Note */}
            <div className="form-control">
              <label className="label"><span className="label-text">Note</span></label>
              <input
                value={form.note}
                onChange={(e) => set('note', e.target.value)}
                placeholder="Optional note"
                className="input input-bordered w-full"
              />
            </div>
          </div>

          <div className="card-actions justify-start mt-6 gap-3">
            <button
              onClick={submit}
              disabled={isPending}
              className="btn btn-primary flex-1"
            >
              {isPending ? 'Saving…' : editingId !== null ? 'Update Transaction' : 'Add Transaction'}
            </button>
            {editingId !== null && (
              <button onClick={cancelEdit} className="btn btn-outline">Cancel</button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Method Filter */}
      {paymentMethodBreakdown.length > 0 && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h3 className="card-title text-lg">Filter by Payment Method</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedPaymentMethod(null)}
                className={`btn btn-sm ${selectedPaymentMethod === null ? 'btn-primary' : 'btn-outline'}`}
              >
                All ({fmt(monthNetAmount)})
              </button>
              {paymentMethodBreakdown.map((pm) => (
                <button
                  key={pm.method}
                  onClick={() => setSelectedPaymentMethod(pm.method)}
                  className={`btn btn-sm ${selectedPaymentMethod === pm.method ? 'btn-primary' : 'btn-outline'}`}
                >
                  {pm.method} ({fmt(pm.total)})
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-lg">
            {MONTH_NAMES[month]} {year} Transactions
          </h2>

          {displayTransactions.length === 0 ? (
            <div className="text-center text-base-content/50 py-8">
              No transactions found for this period.
            </div>
          ) : (
            displayTransactions.map((tx) => (
              <div
                key={tx.id}
                className={[
                  'flex justify-between items-start p-4 border-b last:border-0 hover:bg-base-200 rounded transition',
                  editingId === tx.id ? 'bg-warning/20 border-l-4 border-warning' : '',
                ].join(' ')}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge ${
                      tx.transactionType === 'Income'  ? 'badge-success' :
                      tx.transactionType === 'Savings' ? 'badge-info' : 'badge-error'
                    }`}>
                      {tx.transactionType}
                    </span>
                    {tx.expenseCategory && (
                      <span className="text-sm font-medium capitalize">{tx.expenseCategory}</span>
                    )}
                    <span className="text-xs opacity-50">{tx.date.slice(0, 10)}</span>
                    {tx.paymentMethod && (
                      <span className="text-xs opacity-75 italic">{tx.paymentMethod}</span>
                    )}
                  </div>
                  {tx.note && (
                    <p className="text-xs opacity-70 mt-1 truncate">{tx.note}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <span className={`font-bold text-lg ${
                    tx.transactionType === 'Income'  ? 'text-success' :
                    tx.transactionType === 'Savings' ? 'text-info' : 'text-error'
                  }`}>
                    {tx.transactionType === 'Expense' ? '-' : '+'}
                    {fmt(tx.amount)}
                  </span>
                  <button
                    onClick={() => startEdit(tx)}
                    className="btn btn-ghost btn-sm btn-square"
                    aria-label="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => remove(tx.id)}
                    disabled={isPending}
                    className="btn btn-ghost btn-sm btn-square text-error"
                    aria-label="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
