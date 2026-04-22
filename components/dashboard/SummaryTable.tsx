import { fmt, remainingClass, MONTH_NAMES } from '@/lib/utils'
import { MonthSummary } from '@/lib/types'

interface Props {
  year: number
  month: number
  rows: MonthSummary[]
  totals: { income: number; expenses: number; savings: number; remaining: number }
}

export default function SummaryTable({ year, month, rows, totals }: Props) {
  return (
    <div className="card bg-base-100 shadow-xl mb-8">
      <div className="card-body">
        <h2 className="card-title text-xl">
          {year} — {month === 0 ? 'All Months' : MONTH_NAMES[month]}
        </h2>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="table table-sm w-full min-w-[480px]">
            <thead>
              <tr className="border-b">
                <th className="text-left">Month</th>
                <th className="text-right">Income</th>
                <th className="text-right">Expenses</th>
                <th className="text-right">Savings</th>
                <th className="text-right">Remaining</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.month} className="hover:bg-base-200">
                  <td className="text-left font-medium">{row.monthName}</td>
                  <td className="text-right text-success font-medium">{fmt(row.income)}</td>
                  <td className="text-right text-error font-medium">{fmt(row.expenses)}</td>
                  <td className="text-right text-info font-medium">{fmt(row.savings)}</td>
                  <td className={`text-right font-semibold ${remainingClass(row.remaining)}`}>
                    {fmt(row.remaining)}
                  </td>
                </tr>
              ))}
              <tr className="bg-base-300 font-bold border-t-2">
                <td className="text-left uppercase text-xs tracking-wide">Total</td>
                <td className="text-right text-success">{fmt(totals.income)}</td>
                <td className="text-right text-error">{fmt(totals.expenses)}</td>
                <td className="text-right text-info">{fmt(totals.savings)}</td>
                <td className={`text-right ${remainingClass(totals.remaining)}`}>
                  {fmt(totals.remaining)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
