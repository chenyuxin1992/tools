// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import Routes from './router/index.js'
import 'font-awesome/css/font-awesome.css'
import 'vx-easyui/dist/themes/sg/easyui.css'
import 'vx-easyui/dist/themes/icon.css'
import 'vx-easyui/dist/themes/vue.css'
import ComponentMediaPlayer from './components/ComponentMediaPlayer'
import ComponentPatrolPointTree from './components/ComponentPatrolPointTree'
import ComponentCameraSelector from './components/ComponentCameraSelector'
import ComponentCameraTree from './components/ComponentCameraTree'
import ComponentCanvas from './components/ComponentCanvas'

import EasyUI from 'vx-easyui'
import locale from 'vx-easyui/dist/locale/easyui-lang-zh_CN.js'
import axios from 'axios'
// cnpm install crypto-js
import CryptoJS from 'crypto-js'

// 秘钥与初始向量
const AES_CBC_KEY = CryptoJS.enc.Utf8.parse('JeF8U9wHFOMfs2Y8')
const AES_CBC_IV = CryptoJS.enc.Utf8.parse('Skesj(eE%32sLOap')

Vue.component('ComponentMediaPlayer', ComponentMediaPlayer)
Vue.component('ComponentCameraSelector', ComponentCameraSelector)
Vue.component('ComponentCameraTree', ComponentCameraTree)
Vue.component('ComponentPatrolPointTree', ComponentPatrolPointTree)
Vue.component('ComponentCanvas', ComponentCanvas)

Vue.use(EasyUI, {
  locale: locale
})
Vue.use(VueRouter)

Vue.config.productionTip = false

Vue.prototype.encrypt = function (text) {
  let srcs = CryptoJS.enc.Utf8.parse(text)
  let encrypted = CryptoJS.AES.encrypt(srcs, AES_CBC_KEY, {
    iv: AES_CBC_IV,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  })
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext)
}

Vue.prototype.decrypt = function (response) {
  if (response.headers['content-type'] === 'text/plain') {
    let decrypt = CryptoJS.AES.decrypt(response.data, AES_CBC_KEY, {
      iv: AES_CBC_IV,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8)
    return JSON.parse(decryptedStr)
  } else {
    return response.data
  }
}

Vue.prototype.request = function (method, url, params, callback, errorcallback, finalcallback) {
  let options = {
    method: method,
    headers: {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJqV0FzOXVVdDVTZHkwcEdUMHk1OUZxeXN5aW5TTkFMdSJ9.7a_GA--fn0qiPaywLxo5CQjIhAyX3PNHP4Jeav5n85k'
    },
    async: false,
    url: url
  }

  if (method === 'GET') {
    options.params = params
  } else {
    options.data = params
  }

  axios(options)
    .then((response) => {
      callback(response)
    })
    .catch(errorcallback === null ? (error) => {
      this.$messager.alert({
        title: '提示',
        icon: 'error',
        msg: error
      })
    } : errorcallback)
    .finally(finalcallback)
}

Vue.prototype.dateFormat = function (fmt, date) {
  let ret
  const opt = {
    'Y+': date.getFullYear().toString(),
    'm+': (date.getMonth() + 1).toString(),
    'd+': date.getDate().toString(),
    'H+': date.getHours().toString(),
    'M+': date.getMinutes().toString(),
    'S+': date.getSeconds().toString()
  }
  for (let k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt)
    if (ret) {
      fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, '0')))
    }
  }
  return fmt
}

const router = new VueRouter({
  routes: Routes,
  mode: 'history'
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router: router,
  components: { App },
  template: '<App/>'
})
