import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'

import vuetify from '@/plugins/vuetify'

import '@mdi/font/css/materialdesignicons.css'
import '@fortawesome/fontawesome-free/css/all.css'

import VueSidebarMenu from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'
import store from './store'

import Vuex from 'vuex'
Vue.use(Vuex)

Vue.config.productionTip = false

Vue.use(VueSidebarMenu)

store.dispatch('ENSURE_LOADED_FLIGHTS')
store.dispatch('ENSURE_LOADED_CREWMEMBERS')
store.dispatch('ENSURE_LOADED_AIRPORTS')

// don't pre-cache bookings since we pull every time
// store.dispatch('ENSURE_LOADED_BOOKINGS')

new Vue({
  router,
  vuetify,
  store,
  render: h => h(App)
}).$mount('#app')

export const bus = new Vue()
