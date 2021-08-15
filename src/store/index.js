import Vue from "vue";
import Vuex from "vuex";
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        count: 0,
        loginUser: {
            curOrder: {}
        },
        appId: "wx527d9308300170f5",

        turntableId: null,
        code: null,
        text: "微信推送的文本",
    },
    mutations: {
        increment (state) {
            state.count++
        }
    }

})
export default store