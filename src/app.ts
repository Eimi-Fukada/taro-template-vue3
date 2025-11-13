import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@nutui/nutui-taro/dist/style.css'
import { Skeleton } from '@nutui/nutui-taro'
import './app.less'
import { directiveMap } from './directives'
import { getItem } from './globalStorage'
import { requiresAuth } from './router/router'
import Taro from '@tarojs/taro'
import { setupGlobalRouterGuard } from './router/routerGuard'
import { GlobalDialogPlugin } from './components/alert/global-dialog/globalDialog'

const App = createApp({
  onLaunch() {
    setupGlobalRouterGuard()
    /**
     * 保险起见，如果因为什么特殊的原因导致意外进入了未授权页面，这个时候可以通过这种方式解决物理返回死循环的问题
     */
    // 存储监听器引用
    const routeListener: (res: any) => void = (res) => {
      const token = getItem('Authorization')
      const { path, openType } = res

      // 处理返回操作且目标页需授权
      if (openType === 'navigateBack' && requiresAuth(path) && !token) {
        Taro.reLaunch({ url: '/pages/index/index' })
        return false
      }
    }

    // 监听路由切换
    wx.onBeforeAppRoute(routeListener)

    const stopListener = () => {
      wx.offBeforeAppRoute(routeListener)
    }

    Taro.onAppHide(stopListener)

    Taro.onAppShow(() => {
      wx.onBeforeAppRoute(routeListener) // 重新注册
    })
  },

  onShow(_options) {},
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})

// 批量注册组件和插件
const plugins = [Skeleton, createPinia(), GlobalDialogPlugin]

plugins.forEach((plugin) => App.use(plugin))

// 注册指令
Object.entries(directiveMap).forEach(([name, directive]) => {
  App.directive(name, directive)
})

export default App
