import Taro from '@tarojs/taro'
import { getItem } from '~/globalStorage'
import { requiresAuth } from './router'

export function setupGlobalRouterGuard() {
  const methodNames = [
    'navigateTo',
    'redirectTo',
    'switchTab',
    'reLaunch',
  ] as const

  // 保存原始方法
  const originals = Object.fromEntries(
    methodNames.map((name) => [name, Taro[name].bind(Taro)])
  ) as {
    [K in (typeof methodNames)[number]]: (typeof Taro)[K]
  }

  const originalNavigateBack = Taro.navigateBack.bind(Taro)

  /** 安全获取 URL */
  const getUrlFromOptions = (opts?: { url?: string; path?: string }) =>
    opts?.url || opts?.path || ''

  /** 通用路由守卫 */
  function guard<K extends (typeof methodNames)[number]>(
    name: K,
    options: Parameters<(typeof Taro)[K]>[0]
  ): ReturnType<(typeof Taro)[K]> {
    const token = getItem('Authorization')
    const url = getUrlFromOptions(options)
    const path = url.split('?')[0]

    // 已登录或不需登录 -> 放行
    if (!requiresAuth(path) || token) {
      return originals[name](options || ({} as any)) as ReturnType<
        (typeof Taro)[K]
      >
    }

    // 未登录 -> 跳登录页
    const redirect = encodeURIComponent(url)
    console.warn(`[RouterGuard] 拦截 ${name} 到 ${url}，跳转登录页`)

    return originals.navigateTo({
      url: `/pages/login/index?redirect=${redirect}`,
    }) as ReturnType<(typeof Taro)[K]>
  }

  /** 重写所有方法 */
  methodNames.forEach((name) => {
    Taro[name] = ((options) =>
      guard(name, options || ({} as any))) as (typeof Taro)[typeof name]
  })

  /** navigateBack 不拦截 */
  Taro.navigateBack = (
    options?: Parameters<typeof Taro.navigateBack>[0]
  ): ReturnType<typeof Taro.navigateBack> => {
    return originalNavigateBack(options)
  }

  console.log('[RouterGuard] 全局路由拦截已启用 ✅')
}
