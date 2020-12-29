import Vue from 'vue'
import 'tcon'
import '../assets/api'
import { Tab, Tabs } from 'vant'

// const isIOS = /iphone|ipad|mac/i.test(navigator.userAgent)
Vue.use(Tab).use(Tabs)
Vue.config.productionTip = false
Vue.prototype.$vw = px => `${px / (375 / 100)}vw`
Vue.prototype.$vwSize = px => document.body.clientWidth / 375 * px
Vue.prototype.$handleRedirect = (item) => {
  const srcType = Number(item.srcType)
  if (srcType === 4) {
    window.xm.native('opensearch')
  } else if (srcType === 3) {
    window.xm.openApp({
      appid: item.appId,
      ...(item.color ? {
        navibar: 'h5',
        navibarColor: item.color || 'ffffff'
      } : {}),
      relativeUrl: item.relativeUrl,
      param: item.relativeUrl && /appId/.test(item.relativeUrl) ? undefined : {
        ...(item.param || {}),
        appId: item.appId,
        color: item.color
      }
    })
  } else if (srcType === 2) {
    window.xm.showToast({
      message: '正在开发中，敬请期待'
    })
  } else {
    window.xm.navigateTo({
      url: item.url,
      ...(item.color ? {
        navibar: 'h5',
        navibarColor: item.color || 'ffffff'
      } : {})
    })
  }
}

export default async (router, comp, deps) => {
  if (window.xm) {
    const sourceCheck = () => {
      window.xm.sourceCheck({
        // 使用的卡片组件名称，从管理后台上可以查到
        componentNames: deps
      })
    }
    window.xm.on('onAppResume', sourceCheck)
    window.xm.on('onLoad', sourceCheck)
  }
  // if (process.env.NODE_ENV === 'development') {
  //   sourceCheck()
  // }
  const render = () => {
    new Vue({
      router,
      render: h => comp ? h(comp) : h('div', { id: 'app' }, [h('router-view')])
    }).$mount('#app')
  }
  render()
}
