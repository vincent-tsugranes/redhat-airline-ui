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

new Vue({
  router,
  vuetify,
  store,
  render: h => h(App),
  beforeCreate: function () {
    this.$store.dispatch('GetFlights')
  }
}).$mount('#app')

export const bus = new Vue()
