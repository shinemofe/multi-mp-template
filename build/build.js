const crossSpawn = require('cross-spawn')
const fs = require('fs-extra')
const path = require('path')
const args = process.argv
const dir = args.slice(2)
const vueConfigPath = path.resolve(__dirname, '../vue.config.js')

if (!dir.length) {
  console.log(`\n    ❌ 请输入要打包的文件夹名，例如 npm run build dir-a dir-b dir-c\n`)
  process.exit(0)
}

// 修改入口文件
const config = require(vueConfigPath)
dir.forEach(d => {
  if (Object.keys(config.pages).every(x => x !== d)) {
    console.log(`\n    ❌ 文件夹名 ${d} 不存在\n`)
    process.exit(0)
  }
})

const oldConfig = fs.readFileSync(vueConfigPath, 'utf8')
const conPages = {}
dir.forEach(d => {
  conPages[d] = config.pages[d]
})
config.pages = conPages
fs.outputFileSync(vueConfigPath, `module.exports = ${JSON.stringify(config)}`)

spawn('./node_modules/.bin/vue-cli-service', ['build']).then(() => {
  console.log(`\n    ✅ 打包完成\n`)
  spawn('node', ['build/after-build.js']).then(() => {
    fs.outputFileSync(vueConfigPath, oldConfig)
    console.log(`\n    ✅ 执行完成\n`)
  }).catch(() => {
    fs.outputFileSync(vueConfigPath, oldConfig)
  })
}).catch(() => {
  fs.outputFileSync(vueConfigPath, oldConfig)
})

function spawn (cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const handle = crossSpawn(cmd, args, options)
    handle.stdout.setEncoding('utf8')
    handle.stdout.on('data', (data) => {
      // console.log(`${cmd} stdout: \n${data}`)
      process.stdout.write(data)
      if (/working tree clean/.test(data)) {
        reject(data)
      }
    })
    handle.stderr.setEncoding('utf8')
    handle.stderr.on('data', (data) => {
      // console.error(`${cmd} stderr: \n${data}`)
      // console.error(data)
      process.stderr.write(data)
      // reject(new Error(data))
    })
    handle.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject(new Error(`${cmd} spawn fail !`))
      }
    })
  })
}
