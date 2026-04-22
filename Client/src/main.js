import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { clerkPlugin } from '@clerk/vue'
import App from './App.vue'
import Dashboard from './views/Dashboard.vue'
import Transactions from './views/Transactions.vue'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',             component: Dashboard },
    { path: '/transactions', component: Transactions }
  ]
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(clerkPlugin, { publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY })

app.mount('#app')
