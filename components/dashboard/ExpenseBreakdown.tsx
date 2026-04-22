import Link from 'next/link'
import { fmt, MONTH_NAMES } from '@/lib/utils'
import { MonthSummary } from '@/lib/types'

interface Props {
  month: number
  year: number
  rows: MonthSummary[]
}

export default function ExpenseBreakdown({ month, year, rows }: Props) {
  if (month === 0) return null

  const withExpenses = rows.filter((m) => m.expenseBreakdown.length > 0)

  if (withExpenses.length === 0) {
    return (
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body text-center">
          <p className="text-base-content/70">
            No expense transactions recorded for {MONTH_NAMES[month]} {year}.
          </p>
          <Link href="/transactions" className="link link-primary mt-2">
            Add transactions to see a breakdown here
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">
        {MONTH_NAMES[month]} {year} — Expense Breakdown
      </h2>
      {withExpenses.map((m) => (
        <div key={m.month} className="card bg-base-100 shadow-xl mb-4">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="card-title">{m.monthName}</h3>
              <span className="badge badge-error text-sm">{fmt(m.expenses)}</span>
            </div>
            <div className="divider my-2" />
            <ul className="space-y-2">
              {m.expenseBreakdown.map((item) => (
                <li
                  key={item.category}
                  className="flex justify-between items-center p-2 hover:bg-base-200 rounded"
                >
                  <span className="capitalize">{item.category}</span>
                  <span className="font-medium">{fmt(item.total)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
}
