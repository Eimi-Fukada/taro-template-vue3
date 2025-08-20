/** 支持路径参数替换的拦截器 */
const urlArgsHandler = {
  request: {
    onFulfilled: (config: Taro.Chain) => {
      const requestParams = config.requestParams
      const { url, args } = requestParams
      // 在请求发送前处理URL参数替换
      if (url && args) {
        const lostParams: string[] = []
        const replacedUrl = url.replace(
          /\{([^}]+)\}/g,
          (match, arg: string) => {
            if (!args.hasOwnProperty(arg)) {
              lostParams.push(arg)
            }
            // 使用args中的参数替换URL中的占位符
            return args[arg] !== undefined ? String(args[arg]) : match
          }
        )

        if (lostParams.length) {
          return Promise.reject(
            new Error(`在args中找不到对应的路径参数: ${lostParams.join(', ')}`)
          )
        }

        // 更新请求参数中的URL
        requestParams.url = replacedUrl
      }

      return config.proceed(requestParams)
    },
  },
}

export default urlArgsHandler
