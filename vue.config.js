module.exports = {
  outputDir: 'dist',
  publicPath: './',
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
  }
}
