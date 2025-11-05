// 需要登录的页面路径白名单
const AUTH_WHITELIST = [
  '/pages/index/index',
  '/pages/mine/index',
  '/pages/eventChannel/index',
]

export const requiresAuth = (path: string) => {
  return !AUTH_WHITELIST.includes(path)
}
