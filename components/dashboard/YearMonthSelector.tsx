'use client'

import { useRouter } from 'next/navigation'
import { MONTH_NAMES } from '@/lib/utils'

interface Props {
  year: number
  month: number
}

export default function YearMonthSelector({ year, month }: Props) {
  const router = useRouter()
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  function navigate(key: 'year' | 'month', value: string) {
    const params = new URLSearchParams()
    params.set('year',  key === 'year'  ? value : String(year))
    params.set('month', key === 'month' ? value : String(month))
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={year}
        onChange={(e) => navigate('year', e.target.value)}
        className="select select-bordered select-sm"
      >
        {yearOptions.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <select
        value={month}
        onChange={(e) => navigate('month', e.target.value)}
        className="select select-bordered select-sm"
      >
        <option value={0}>All Months</option>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>{MONTH_NAMES[m]}</option>
        ))}
      </select>
    </div>
  )
}
