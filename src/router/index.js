import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(process.env.NODE_ENV === 'production' ? '/88studio/' : '/'),
  routes: [
    // ... your routes ...
  ]
}) 