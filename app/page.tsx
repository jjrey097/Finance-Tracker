import { Suspense } from 'react'
import Navbar from '@/components/Navbar'
import StatsCards from '@/components/dashboard/StatsCards'
import SummaryTable from '@/components/dashboard/SummaryTable'
import ExpenseBreakdown from '@/components/dashboard/ExpenseBreakdown'
import YearMonthSelector from '@/components/dashboard/YearMonthSelector'
import { getAnnualSummary } from '@/lib/data'

interface Props {
  searchParams: Promise<{ year?: string; month?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const params  = await searchParams
  const year    = parseInt(params.year  ?? String(new Date().getFullYear()))
  const month   = parseInt(params.month ?? '0')

  const summary = await getAnnualSummary(year)

  const tableRows = month === 0
    ? summary.months
    : summary.months.filter((m) => m.month === month)

  const totals = month === 0
    ? summary.totals
    : tableRows[0]
      ? { income: tableRows[0].income, expenses: tableRows[0].expenses, savings: tableRows[0].savings, remaining: tableRows[0].remaining }
      : { income: 0, expenses: 0, savings: 0, remaining: 0 }

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Suspense>
            <YearMonthSelector year={year} month={month} />
          </Suspense>
        </div>

        <StatsCards {...totals} />
        <SummaryTable year={year} month={month} rows={tableRows} totals={totals} />
        <ExpenseBreakdown month={month} year={year} rows={tableRows} />
      </main>
    </>
  )
}
