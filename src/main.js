// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
// 引入的多的话
import { Button, Row, Col,CellGroup ,Icon,Field,Tab,Tabs  } from 'vant'
Vue.use(Button).use(Row).use(Col).use(CellGroup).use(Icon).use(Field ).use(Tab).use(Tabs)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
