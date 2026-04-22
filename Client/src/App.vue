<script setup>
import { useAuth, SignedIn, SignedOut, SignIn, UserButton } from '@clerk/vue'
import axios from 'axios'

const { getToken } = useAuth()

// Attach Clerk JWT to every outgoing API request
axios.interceptors.request.use(async (config) => {
  const token = await getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
</script>

<template>
  <div data-theme="light" class="min-h-screen bg-base-100">

    <SignedIn>
      <div class="navbar bg-base-200 shadow">
        <div class="flex-1 px-2 lg:px-0">
          <span class="text-xl font-bold text-primary">Finance Tracker</span>
        </div>
        <div class="flex-none gap-2 px-2">
          <RouterLink to="/" class="btn btn-ghost btn-sm">Dashboard</RouterLink>
          <RouterLink to="/transactions" class="btn btn-ghost btn-sm">Transactions</RouterLink>
          <UserButton />
        </div>
      </div>
      <main class="max-w-5xl mx-auto p-6">
        <RouterView />
      </main>
    </SignedIn>

    <SignedOut>
      <div class="flex items-center justify-center min-h-screen">
        <SignIn />
      </div>
    </SignedOut>

  </div>
</template>
