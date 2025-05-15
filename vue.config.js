const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
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
  },
  publicPath: process.env.NODE_ENV === 'production'
    ? '/88studio/'
    : '/',
  chainWebpack: config => {
    config.plugin('copy').tap(([options]) => {
      options[0].ignore = [...(options[0].ignore || []), 'README.md']
      return [options]
    })
  }
})