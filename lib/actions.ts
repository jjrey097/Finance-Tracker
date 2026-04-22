'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from './prisma'
import { TransactionPayload } from './types'

async function getUserId(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')
  return userId
}

export async function addTransaction(payload: TransactionPayload) {
  const userId = await getUserId()

  await prisma.transaction.create({
    data: {
      userId,
      date:            new Date(payload.date),
      transactionType: payload.transactionType,
      expenseCategory: payload.transactionType === 'Expense' ? payload.expenseCategory : null,
      amount:          payload.amount,
      paymentMethod:   payload.transactionType === 'Expense' ? payload.paymentMethod : '',
      note:            payload.note || null,
    },
  })

  revalidatePath('/')
  revalidatePath('/transactions')
}

export async function updateTransaction(id: number, payload: TransactionPayload) {
  const userId = await getUserId()

  await prisma.transaction.updateMany({
    where: { id, userId },
    data: {
      date:            new Date(payload.date),
      transactionType: payload.transactionType,
      expenseCategory: payload.transactionType === 'Expense' ? payload.expenseCategory : null,
      amount:          payload.amount,
      paymentMethod:   payload.transactionType === 'Expense' ? payload.paymentMethod : '',
      note:            payload.note || null,
    },
  })

  revalidatePath('/')
  revalidatePath('/transactions')
}

export async function deleteTransaction(id: number) {
  const userId = await getUserId()

  await prisma.transaction.deleteMany({ where: { id, userId } })

  revalidatePath('/')
  revalidatePath('/transactions')
}

export async function setBudget(month: number, year: number, monthlyLimit: number) {
  const userId = await getUserId()

  await prisma.budget.upsert({
    where:  { userId_month_year: { userId, month, year } },
    update: { monthlyLimit },
    create: { userId, month, year, monthlyLimit },
  })

  revalidatePath('/')
}
