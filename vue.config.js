const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production' ? '/88studio/' : '/',
  outputDir: 'dist',
  assetsDir: '',
  productionSourceMap: false,
  devServer: {
    proxy: {
      '/api': {
        target: 'https://api-three-drab-49.vercel.app',
        changeOrigin: true,
        secure: false,
        headers: {
          Connection: 'keep-alive'
        }
      }
    }
  }
})