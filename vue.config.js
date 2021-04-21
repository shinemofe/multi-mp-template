module.exports = {
  outputDir: 'dist',
  publicPath: './',
  productionSourceMap: false,
  pages: {
    /*inserted*/
    demo: {
      entry: 'src/entry/demo.js',
      chunks: ['chunk-vendors', 'chunk-common', 'demo'],
      color: ''
    },
  },
  devServer: {
    disableHostCheck: true,
    host: '0.0.0.0',
    proxy: {
      '/sync-contacts': {
        target: 'http://121.239.102.59:21008',
        changeOrigin: true
      }
    }
  },
  configureWebpack: {
    externals: {
        echarts: 'echarts',
        vue: 'Vue'
      }
  },
  // 如果不需要 eslint，可以打开这行注释
  // chainWebpack: config => config.module.rules.delete('eslint')
}
