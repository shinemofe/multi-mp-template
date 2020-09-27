const fs = require('fs-extra')
const path = require('path')

const args = process.argv[2]
if (!args) {
  console.log('请输入文件夹名称')
  process.exit(0)
}

const getSrc = str => path.resolve(__dirname, '../', str)

// 校验重复
fs.readdirSync(getSrc('src/views')).forEach(dir => {
  if (dir === args) {
    console.log('文件夹已存在！')
    process.exit(0)
  }
})

// 1. 创建 public 目录
fs.ensureDirSync(getSrc('public/asserts-' + args))

// 2. 创建 entry
fs.outputFileSync(getSrc(`src/entry/${args}.js`), `import init from './common'
import router from '../router/${args}'
import deps from '../deps/${args}'
init(router, null, deps.flat())
`)

// 3.创建 router
fs.outputFileSync(getSrc(`src/router/${args}.js`), `import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: '首页'
    },
    component: () => import('../views/${args}/index.vue')
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
`)

// 4. 创建 views
fs.outputFileSync(getSrc(`src/views/${args}/index.vue`), `<template>
  <div class="${args}">
    <van-tabs
      v-model="active"
      color="#4EB4FF"
      line-width="60px"
      title-active-color="#4EB4FF"
      sticky
      :swipe-threshold="3"
    >
      <van-tab title="菜单一" />
      <van-tab title="菜单二" />
      <van-tab title="菜单三" />
      <div class="pt10"></div>

      <xmcard-render
        v-for="item in mock"
        :key="item"
        :name="item"
      />
    </van-tabs>
  </div>
</template>

<script>
import deps from '@/deps/${args}'

export default {
  components: {
  },

  data () {
    return {
      active: 0
    }
  },

  computed: {
    mock () {
      return deps[this.active]
    }
  }
}
</script>
`)

// 5. 修改 vue.config.js
const config = getSrc('vue.config.js')
const con = fs.readFileSync(config, 'utf8')

fs.outputFileSync(config, con.replace('/*inserted*/', `/*inserted*/
    ${args}: {
      entry: 'src/entry/${args}.js',
      chunks: ['chunk-vendors', 'chunk-common', '${args}'],
      color: ''
    },`))
fs.outputFileSync(getSrc('vue.config-bak.js'), fs.readFileSync(config, 'utf8'))

// 6. 创建 deps
fs.outputFileSync(getSrc(`src/deps/${args}.js`), `export default [
  []
]
`)

console.log('初始化完成')
