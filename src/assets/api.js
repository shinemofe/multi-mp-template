import Vue from 'vue'

const isDebug = process.env.NODE_ENV === 'development'
const baseUrl = ''

function paramToString (obj) {
  return Object.keys(obj).map(k => {
    return `${k}=${encodeURIComponent(obj[k])}`
  }).join('&')
}

const nativeFetch = (url, params = {}) => {
  url = getFullApiUrl(url)
  params.credentials = true
  params.isRelative = true
  !params.headers &&
    (params.headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    })
  !params.method && (params.method = 'GET')
  return new Promise((resolve, reject) => {
    window.xm
      .fetch(url, params)
      .then(res => res.json())
      .then(data => {
        if (data.success || data.code === 200 || data.retcode === 0) {
          resolve(data)
        } else {
          window.xm.showToast({
            message: data.msg || '服务异常'
          })
          reject(data)
        }
      })
      .catch(e => {
        reject(e)
      })
  })
}

const browserFetch = (url, params = {}) => {
  !params.headers &&
    (params.headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    })
  !params.method && (params.method = 'GET')

  return new Promise((resolve, reject) => {
    window
      .fetch(url, params)
      .then(res => res.json())
      .then(data => {
        if (data.success || data.retcode === 0 || data.code === 200) {
          resolve(data)
        } else {
          reject(data)
        }
      })
      .catch(e => {
        reject(e)
      })
  })
}

export const getFullApiUrl = url => {
  return isDebug ? (baseUrl + url) : url
}

export const http = (url, params = {}) => {
  if ((params.method || '').toUpperCase() !== 'POST') {
    params.body && (url += '?' + paramToString(params.body))
    delete params.body
  } else {
    params.body = JSON.stringify(params.body)
  }
  return (isDebug ? browserFetch : nativeFetch)(url, params)
}

http.get = (url, params) => {
  return http(url, { ...(params || {}), method: 'GET' })
}

http.post = (url, params) => {
  return http(url, { ...(params || {}), method: 'POST' })
}

Vue.prototype.$http = http
