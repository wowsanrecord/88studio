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
  configureWebpack: {
    plugins: [
      {
        apply: compiler => {
          compiler.hooks.done.tap('BuildDonePlugin', () => {
            // 빌드가 완료된 후 실행되는 로직
            console.log('Build completed successfully!')
          })
        }
      }
    ]
  },
  outputDir: 'dist'
})