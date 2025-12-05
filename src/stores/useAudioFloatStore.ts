import { defineStore } from 'pinia'
import { reactive } from 'vue'
import Taro from '@tarojs/taro'

export const useAudioFloatStore = defineStore('audioFloat', () => {
  const state = reactive({
    visible: false, // 是否显示浮窗
    forceHide: false, // 当前页面是否强制隐藏浮窗
    position: { x: 0, y: 0 }, // 浮窗当前坐标（页面级可共享）
    initialized: false, // 是否已经初始化过定位
  })

  /**
   * 初始化浮窗默认位置（只执行一次）
   * 必须由浮窗组件在 onMounted 时调用
   */
  const initPosition = () => {
    if (state.initialized) return

    const { screenWidth, screenHeight } = Taro.getWindowInfo()

    state.position = {
      x: screenWidth - 166,
      y: screenHeight - 140,
    }

    state.initialized = true
  }

  /** 手动关闭浮窗（点 ×） */
  const close = () => {
    state.visible = false
  }

  /** 全局显示浮窗 */
  const show = () => {
    if (!state.forceHide) state.visible = true
  }

  /** 某页面强制隐藏浮窗 */
  const hideForPage = () => {
    state.forceHide = true
    state.visible = false
  }

  /** 某页面恢复浮窗显示 */
  const showForPage = () => {
    state.forceHide = false
    state.visible = true
  }

  /** 更新浮窗位置（拖动时调用） */
  const updatePosition = (pos: { x: number; y: number }) => {
    state.position = pos
  }

  return {
    state,
    initPosition,
    close,
    show,
    hideForPage,
    showForPage,
    updatePosition,
  }
})
