import Navbar from '@/components/Navbar'
import TransactionsClient from '@/components/transactions/TransactionsClient'
import { getTransactions } from '@/lib/data'

interface Props {
  searchParams: Promise<{ month?: string; year?: string }>
}

export default async function TransactionsPage({ searchParams }: Props) {
  const params = await searchParams
  const now    = new Date()
  const month  = parseInt(params.month ?? String(now.getMonth() + 1))
  const year   = parseInt(params.year  ?? String(now.getFullYear()))

  const transactions = await getTransactions()

  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto p-4 sm:p-6">
        <TransactionsClient transactions={transactions} month={month} year={year} />
      </main>
    </>
  )
}
