import { auth } from '@clerk/nextjs/server'
import { prisma } from './prisma'
import { AnnualSummary, MonthSummary, SerializedTransaction } from './types'
import { MONTH_NAMES } from './utils'

export async function getTransactions(): Promise<SerializedTransaction[]> {
  const { userId } = await auth()
  if (!userId) return []

  const rows = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })

  return rows.map((t) => ({
    ...t,
    date: t.date.toISOString().slice(0, 10),
    amount: t.amount.toNumber(),
  }))
}

export async function getAnnualSummary(year: number): Promise<AnnualSummary> {
  const { userId } = await auth()

  const empty: AnnualSummary = {
    year,
    months: [],
    totals: { income: 0, expenses: 0, savings: 0, remaining: 0 },
  }

  if (!userId) return empty

  const rows = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: new Date(year, 0, 1), lt: new Date(year + 1, 0, 1) },
    },
  })

  const months: MonthSummary[] = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1
    const txs = rows.filter((t) => new Date(t.date).getMonth() + 1 === m)

    const income   = txs.filter((t) => t.transactionType === 'Income').reduce((s, t) => s + t.amount.toNumber(), 0)
    const expenses = txs.filter((t) => t.transactionType === 'Expense').reduce((s, t) => s + t.amount.toNumber(), 0)
    const savings  = txs.filter((t) => t.transactionType === 'Savings').reduce((s, t) => s + t.amount.toNumber(), 0)

    const breakdown = Object.entries(
      txs
        .filter((t) => t.transactionType === 'Expense')
        .reduce<Record<string, number>>((acc, t) => {
          const cat = t.expenseCategory ?? 'other'
          acc[cat] = (acc[cat] ?? 0) + t.amount.toNumber()
          return acc
        }, {})
    )
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total)

    return {
      month: m,
      monthName: MONTH_NAMES[m],
      income,
      expenses,
      savings,
      remaining: income - expenses - savings,
      expenseBreakdown: breakdown,
    }
  })

  const totals = months.reduce(
    (acc, m) => ({
      income:    acc.income    + m.income,
      expenses:  acc.expenses  + m.expenses,
      savings:   acc.savings   + m.savings,
      remaining: acc.remaining + m.remaining,
    }),
    { income: 0, expenses: 0, savings: 0, remaining: 0 }
  )

  return { year, months, totals }
}
