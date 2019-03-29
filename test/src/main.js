import { legoInit, legoPerfVue } from '@zz/lego'
import Vue from 'vue'
import '@zz/sasscore/flexible.js'
import VueLazyLaod from 'vue-lazyload'
import router from '@router'
import store from '@store'
import App from './App'
// 全局初始化乐高埋点的值，默认合入backup
legoInit()

try {
  Vue.use(legoPerfVue)
} catch (err) {
  console.warn(err)
}
// 图片懒加载
Vue.use(VueLazyLaod, {
  preLoad: 1.3,
  try: 2,
  error: 'dist/error.png',
  loading: 'dist/loading.gif'
})
// 业务代码
window.vm = new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
