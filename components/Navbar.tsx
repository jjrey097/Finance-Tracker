import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export default function Navbar() {
  return (
    <div className="navbar bg-base-200 shadow">
      <div className="flex-1 px-2 lg:px-4">
        <span className="text-xl font-bold text-primary">Finance Tracker</span>
      </div>
      <div className="flex-none gap-2 px-2">
        <Link href="/" className="btn btn-ghost btn-sm">Dashboard</Link>
        <Link href="/transactions" className="btn btn-ghost btn-sm">Transactions</Link>
        <UserButton />
      </div>
    </div>
  )
}
