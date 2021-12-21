// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import store from './store'
Vue.prototype.$axios = axios
// import Vconsole from 'vconsole'
// let vConsole = new Vconsole()
// Vue.use(vConsole)
import { Button, Row, Col, CellGroup, Icon, Field, Tab, Tabs, Toast, Loading, Dialog, Swipe, SwipeItem } from 'vant'
Vue.use(Button).use(Row).use(Col).use(CellGroup).use(Icon).use(Field).use(Tab).use(Tabs).use(Toast).use(Loading).use(Dialog).use(Swipe).use(SwipeItem)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
