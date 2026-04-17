import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
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

createApp(App).use(createPinia()).use(router).mount('#app')