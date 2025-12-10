const path = require('path')
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
import ComponentsPlugin from 'unplugin-vue-components/webpack'
import NutUIResolver from '@nutui/auto-import-resolver'

const config = {
  projectName: 'TaroTemplate',
  date: '2025-10-28',
  designWidth(input) {
    // 配置 NutUI 375 尺寸
    if (input?.file?.replace(/\\+/g, '/').indexOf('@nutui') > -1) {
      return 375
    }
    // 全局使用 Taro 默认的 750 尺寸
    return 750
  },
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
    375: 2 / 1,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: ['@tarojs/plugin-html'],
  defineConstants: {
    VUE_APP_ENV: JSON.stringify(process.env.VUE_APP_ENV),
  },
  copy: {
    patterns: [],
    options: {},
  },
  framework: 'vue3',
  // Taro3不用配置异步编程,所以每次编译H5都会报错，改成下面的配置
  compiler: {
    type: 'webpack5',
    // 仅 webpack5 支持依赖预编译配置
    prebundle: {
      enable: false,
      force: true,
      exclude: ['@nutui/nutui-taro', '@nutui/icons-vue-taro'],
    },
  },
  cache: {
    enable: false,
    // enable: true, // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
  },
  mini: {
    hot: true,
    // 使用 Taro 原生的 CSS 压缩配置
    csso: {
      enable: true,
      config: {
        // 配置项同 https://cssnano.co/docs/what-are-optimisations/
        // 更激进的 CSS 压缩选项
        restructure: true, // 启用 CSS 结构优化
        forceMediaMerge: true, // 合并相同的媒体查询
        semicolonAfterLastBlock: false, // 最后一个块后不加分号
        comments: false, // 移除注释
        discardUnused: true, // 移除未使用的 CSS 规则
        mergeIdents: true, // 合并相同的标识符
        reduceIdents: true, // 减少标识符
        minifySelectors: true, // 压缩选择器
      },
    },
    webpackChain(chain, webpack) {
      chain.merge({
        // 添加性能优化配置
        performance: {
          // 提高资产大小限制，避免警告
          maxAssetSize: 500000, // 500KB
          maxEntrypointSize: 500000, // 500KB
          hints: false, // 关闭性能提示
        },
        module: {
          rule: {
            mjsScript: {
              test: /\.mjs$/,
              include: [/pinia/],
              use: {
                babelLoader: {
                  loader: require.resolve('babel-loader'),
                },
              },
            },
          },
        },
        plugin: {
          install: {
            plugin: UnifiedWebpackPluginV5,
            args: [
              {
                appType: 'taro',
                // 下面个配置，会开启 rem -> rpx 的转化
                // rem2rpx: true,
                injectAdditionalCssVarScope: true,
              },
            ],
          },
        },
        // taro 有时候会报错app.js错误:  ReferenceError: chunkLoadingGlobal is not defined，要加这个
        output: {
          chunkLoadingGlobal: 'webpackJsonp',
        },
      })

      chain.plugin('unplugin-vue-components').use(
        ComponentsPlugin({
          resolvers: [NutUIResolver({ taro: true })],
        })
      )

      // ✅ 在这里注入 Vue 的编译期特性 flag
      chain.plugin('define-vue-flags').use(webpack.DefinePlugin, [
        {
          __VUE_OPTIONS_API__: JSON.stringify(true),
          __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
        },
      ])
    },
    miniCssExtractPluginOption: {
      ignoreOrder: true,
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: { minPixelValue: 0, onePxTransform: true },
      },
      url: {
        enable: true,
        config: {
          limit: 1024, // 设定转换尺寸上限
        },
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
    alias: {
      '~': path.resolve(__dirname, '../', 'src'),
    },
    optimizeMainPackage: {
      enable: true,
    },
  },
  h5: {
    webpackChain(chain) {
      chain.merge({
        performance: {
          //入口起点的最大体积 限制500kb
          maxEntrypointSize: 10000000,
          //生成文件的最大体积
          maxAssetSize: 30000000,
        },
      })

      chain.plugin('unplugin-vue-components').use(
        ComponentsPlugin({
          resolvers: [NutUIResolver({ taro: true })],
        })
      )
    },
    // esnextModules: ['taro-ui'],
    publicPath: '/',
    staticDirectory: 'static',
    // h5 打包带上hash值
    output: {
      filename: 'js/[name].[hash].js',
      chunkFilename: 'js/[name].[chunkhash].js',
    },
    imageUrlLoaderOption: {
      limit: 5000,
      name: 'static/images/[name].[hash].[ext]',
    },
    miniCssExtractPluginOption: {
      filename: 'css/[name].[hash].css',
      chunkFilename: 'css/[name].[chunkhash].css',
      ignoreOrder: true,
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: { minPixelValue: 0, onePxTransform: true, baseFontSize: 10 },
      },
      autoprefixer: {
        enable: true,
      },
      cssModules: {
        enable: true, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: 'module', // 转换模式，取值为 global/module
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
    router: {
      /** ["/","/ind"]可以支持多路由访问同一个页面实例 */
      customRoutes: {
        '/pages/index/index': '/',
        '/pages/mine/index': '/mine',
      },
    },
    alias: {
      '~': path.resolve(__dirname, '../', 'src'),
    },
  },
}

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'))
  }
  return merge({}, config, require('./prod'))
}
