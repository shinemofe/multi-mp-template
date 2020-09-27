const path = require('path')
const fs = require('fs-extra')
const JSZip = require('jszip')
const crossSpawn = require('cross-spawn')
const rimraf = require('rimraf')
const entryConfig = require(path.join(__dirname, '../vue.config.js'))
const distPath = path.join(__dirname, '../dist')
const zipDistPath = path.join(__dirname, '../zip')
const isMac = process.platform === 'darwin'

// 递归 dist 目录，将所有 /asserts 引用 换成 ./asserts
function _doReplace (file) {
  const content = fs.readFileSync(file, 'utf8')
  const isSecondPath = /\.(css)$/.test(path.extname(file))
  if (/asserts/.test(content)) {
    fs.outputFileSync(file, content.replace(/\/asserts/g, `${isSecondPath ? '.' : ''}./asserts`))
    console.log('🔥 改动的文件：', file)
  }
}
function deepReplace (dirPath) {
  fs.readdirSync(dirPath).forEach(name => {
    const current = path.resolve(dirPath, name)
    const stat = fs.statSync(current)
    if (stat.isFile()) {
      _doReplace(current)
    } else {
      deepReplace(current)
    }
  })
}
deepReplace(distPath)

function copyVendors (zipPath, entryName, type) {
  fs.readdirSync(path.join(distPath, type)).forEach(js => {
    if (/chunk-/.test(js) || new RegExp(entryName).test(js)) {
      fs.copySync(path.join(distPath, type, js), path.join(zipPath, type, js))
    }
  })
}

function doZip (zipName, distDir) {
  return new Promise((resolve, reject) => {
    if (isMac) {
      console.log('🔧 使用 zip 压缩...')
      spawn('zip', ['-qr', `${zipName}.zip`, './'], { cwd: distDir }).then(() => {
        console.log('🔧 zip 压缩完成，处理收尾...')
        resolve()
      }).catch((err) => {
        reject(err)
      })
    } else {
      console.log('🔧 使用 jszip 压缩...')
      const winZip = new JSZip()
      const deepFile = (dir, prefix = '') => {
        for (const f of fs.readdirSync(dir)) {
          // 判断 f 是文件还是文件夹
          const current = path.resolve(dir, f)
          const stat = fs.statSync(current)
          if (stat.isFile()) {
            winZip.file(prefix + f, fs.readFileSync(current))
          } else if (stat.isDirectory()) {
            // 文件夹
            deepFile(path.join(dir, f), prefix + `${f}/`)
          }
        }
      }
      deepFile(distDir)
      winZip
        .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
        .pipe(fs.createWriteStream(path.resolve(distDir, `${zipName}.zip`)))
        .on('finish', function () {
          console.log('🔧 jszip 压缩完成，处理收尾...')
          resolve()
        })
    }
  })
}

function spawn (cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const handle = crossSpawn(cmd, args, options)
    handle.stdout.setEncoding('utf8')
    handle.stdout.on('data', (data) => {
      console.log(`${cmd} stdout: \n${data}`)
      if (/working tree clean/.test(data)) {
        reject(data)
      }
    })
    handle.stderr.setEncoding('utf8')
    handle.stderr.on('data', (data) => {
      console.error(`${cmd} stderr: \n${data}`)
      reject(new Error(data))
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

Object.keys(entryConfig.pages).forEach(async entryName => {
  const zipPath = path.join(distPath, entryName)
  fs.ensureDirSync(zipPath)
  // 复制package.json文件到每个小程序包中
  fs.copySync(path.join(distPath, 'plugin.json'), path.join(zipPath, 'plugin.json'))
  if (entryConfig.pages[entryName].color) {
    try {
      // 根据配置的color，修改color
      const result = JSON.parse(fs.readFileSync(path.join(zipPath, 'plugin.json'), 'utf-8'))

      result.color = entryConfig.pages[entryName].color

      const r = JSON.stringify(result, null, 4)
      fs.writeFileSync(path.join(zipPath, 'plugin.json'), r, 'utf-8')
    } catch(e) {
      console.error(`修改 ${entryName} plugin.json文件失败`, e)
    }
  }

  fs.copySync(path.join(distPath, `${entryName}.html`), path.join(zipPath, 'index.html'))
  fs.copySync(path.join(distPath, `lib`), path.join(zipPath, 'lib'))
  const assertsLib = path.join(distPath, `asserts-${entryName}`)
  if (fs.existsSync(assertsLib)) {
    fs.copySync(assertsLib, path.join(zipPath, `asserts-${entryName}`))
  }
  fs.existsSync(path.join(distPath, `img`)) && fs.copySync(path.join(distPath, `img`), path.join(zipPath, 'img'))
  fs.existsSync(path.join(distPath, `styles`)) && fs.copySync(path.join(distPath, `styles`), path.join(zipPath, 'styles'))
  copyVendors(zipPath, entryName, 'js')
  copyVendors(zipPath, entryName, 'css')

  fs.ensureDirSync(zipDistPath)
  await doZip(entryName, zipPath)
  // await spawn('zip', ['-qr', `${entryName}.zip`, './'], { cwd: zipPath })
  await fs.move(path.join(zipPath, `${entryName}.zip`), path.join(zipDistPath, `${entryName}.zip`), { overwrite: true })
  // await spawn('rm', ['-rf', zipPath])
  rimraf.sync(zipPath)
})
