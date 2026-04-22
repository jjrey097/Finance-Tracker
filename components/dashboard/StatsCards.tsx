import { fmt, remainingClass } from '@/lib/utils'

interface Props {
  income: number
  expenses: number
  savings: number
  remaining: number
}

export default function StatsCards({ income, expenses, savings, remaining }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div className="stat bg-base-200 rounded-lg p-4">
        <div className="stat-title text-sm">Income</div>
        <div className="stat-value text-2xl text-success">{fmt(income)}</div>
      </div>
      <div className="stat bg-base-200 rounded-lg p-4">
        <div className="stat-title text-sm">Expenses</div>
        <div className="stat-value text-2xl text-error">{fmt(expenses)}</div>
      </div>
      <div className="stat bg-base-200 rounded-lg p-4">
        <div className="stat-title text-sm">Savings</div>
        <div className="stat-value text-2xl text-info">{fmt(savings)}</div>
      </div>
      <div className={`stat bg-base-200 rounded-lg p-4 ${remainingClass(remaining)}`}>
        <div className="stat-title text-sm">Remaining</div>
        <div className="stat-value text-2xl">{fmt(remaining)}</div>
      </div>
    </div>
  )
}
