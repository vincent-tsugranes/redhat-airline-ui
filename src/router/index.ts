import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/map',
    name: 'Live Map',
    component: () => import('../components/LiveMap.vue')
  },
  {
    path: '/flights',
    name: 'Flights',
    component: () => import('../components/Flights.vue')
  },
  {
    path: '/crewmembers',
    name: 'Crewmembers',
    component: () => import('../components/CrewmemberList.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
