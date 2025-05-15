import { createRouter, createWebHistory } from 'vue-router'
import StudioReservation from '@/components/StudioReservation.vue'

const router = createRouter({
  history: createWebHistory(process.env.NODE_ENV === 'production' ? '/88studio/' : '/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: StudioReservation
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

export default router 