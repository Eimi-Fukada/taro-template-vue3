module.exports = {
  env: {
    NODE_ENV: '"production"',
  },
  defineConstants: {},
  mini: {},
  h5: {
    webpackChain(chain) {
      // 在这里可以看到各种包的情况，方便优化
      // chain
      //   .plugin('analyzer')
      //   .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [])
      //   .end()

      // 添加gzip压缩插件
      chain.plugin('compression').use(require('compression-webpack-plugin'), [
        {
          // 这里的选项可以根据你的需求进行调整
          algorithm: 'gzip', // 使用gzip压缩
          test: /\.js(\?.*)?$/i, // 仅压缩JS文件
          threshold: 10240, // 仅压缩大于10kb的文件
          minRatio: 0.8, // 只有压缩率小于这个值的文件才会被压缩
          deleteOriginalAssets: false, // 不删除原始文件
        },
      ])
    },
  },
}
