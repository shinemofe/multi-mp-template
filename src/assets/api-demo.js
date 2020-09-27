import Vue from 'vue'

const base = process.env.NODE_ENV === 'development' ? 'http://baas.uban360.net:21006' : ''

function post (url, data) {
  return Vue.prototype.$http.post(
    base + url,
    {
      body: data,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}

// 示例接口
export function getSomeList () {
  return post('/path/to/name', {})
}
