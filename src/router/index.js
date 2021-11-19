import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld';
import chargeIndex from "@/components/chargeIndex";
import hotelPay from "@/components/hotelPay";
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    },
    {
      path: '/chargeIndex',
      name: 'chargeIndex',
      component: chargeIndex
    },
    {
      path: '/hotelPay',
      name: 'hotelPay',
      component: hotelPay
    }
  ]
})
