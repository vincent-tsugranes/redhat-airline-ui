import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'

import vuetify from '@/plugins/vuetify'

import '@mdi/font/css/materialdesignicons.css'
import '@fortawesome/fontawesome-free/css/all.css'

import VueSidebarMenu from 'vue-sidebar-menu'
import 'vue-sidebar-menu/dist/vue-sidebar-menu.css'

Vue.config.productionTip = false

Vue.use(VueSidebarMenu)

new Vue({
    router,
    vuetify,
    render: h => h(App)
}).$mount('#app')
