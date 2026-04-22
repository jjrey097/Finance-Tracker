import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Finance Tracker',
  description: 'Track your income, expenses, and savings',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" data-theme="light">
        <body className="min-h-screen bg-base-100">{children}</body>
      </html>
    </ClerkProvider>
  )
}
