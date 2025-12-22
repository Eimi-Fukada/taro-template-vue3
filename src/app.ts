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
import { useAudioStore } from './stores/useAudioStore'

const pinia = createPinia()

// 检查小程序更新的方法
const checkForUpdate = () => {
  // #ifdef MP-WEIXIN
  const updateManager = wx.getUpdateManager()

  updateManager.onCheckForUpdate((res: any) => {
    console.log('是否有新版本：', res.hasUpdate)
  })

  updateManager.onUpdateReady(() => {
    wx.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success: (res: any) => {
        if (res.confirm) {
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          updateManager.applyUpdate()
        }
      },
    })
  })

  updateManager.onUpdateFailed(() => {
    // 新版本下载失败
    wx.showModal({
      title: '更新失败',
      content: '新版本下载失败，请检查网络后重试',
      showCancel: false,
    })
  })
  // #endif
}

// 设置网络状态监听的方法
const setupNetworkStatusListener = () => {
  // 获取当前网络状态
  Taro.getNetworkType({
    success: (res: any) => {
      console.log('当前网络类型：', res.networkType)
      if (res.networkType === 'none') {
        Taro.showToast({
          title: '网络连接不可用',
          icon: 'none',
          duration: 2000,
        })
      }
    },
  })

  // 注册网络状态监听器
  Taro.onNetworkStatusChange((res: any) => {
    console.log('网络状态变化：', res)
    if (!res.isConnected) {
      Taro.showToast({
        title: '网络连接已断开',
        icon: 'none',
        duration: 2000,
      })
    } else if (res.networkType === '2g' || res.networkType === '3g') {
      Taro.showToast({
        title: '网络信号较弱',
        icon: 'none',
        duration: 2000,
      })
    }
  })
}

// 移除网络状态监听的方法
const removeNetworkStatusListener = () => {
  // 取消所有网络状态监听
  Taro.offNetworkStatusChange()
}

const App = createApp({
  onLaunch() {
    App.use(pinia)

    const audioStore = useAudioStore()
    audioStore.init()

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
      // 小程序显示时重新设置网络监听
      setupNetworkStatusListener()
    })

    // 检查小程序更新
    checkForUpdate()

    // 监听网络状态
    setupNetworkStatusListener()
  },

  onShow(_options) {},

  onHide() {
    // 小程序隐藏时移除网络监听，节省性能
    removeNetworkStatusListener()
  },
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})

// 批量注册组件和插件
const plugins = [Skeleton, GlobalDialogPlugin]

plugins.forEach((plugin) => App.use(plugin))

// 注册指令
Object.entries(directiveMap).forEach(([name, directive]) => {
  App.directive(name, directive)
})

export default App
