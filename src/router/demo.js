import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: '首页'
    },
    component: () => import('../views/demo/index.vue')
  }
]

const router = new VueRouter({
  routes,
  scrollBehavior: () => {
    return { x: 0, y: 0 }
  }
})

router.afterEach(to => {
  document.title = to.meta.title
})

export default router
