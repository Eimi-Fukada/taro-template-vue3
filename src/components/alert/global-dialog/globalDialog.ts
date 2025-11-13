import { reactive, App } from 'vue'
import Taro from '@tarojs/taro'

export interface DialogOptions {
  content?: string
  cancelText?: string
  confirmText?: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

interface DialogState {
  visible: boolean
  content: string
  cancelText: string
  confirmText: string
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

export class GlobalDialogManager {
  private state: DialogState = reactive({
    visible: false,
    content: '',
    cancelText: '取消',
    confirmText: '确定',
    onConfirm: undefined,
    onCancel: undefined,
  })

  /**
   * 显示弹窗
   */
  show(options: DialogOptions) {
    return new Promise<boolean>((resolve) => {
      // 重置状态
      this.reset()

      this.state.visible = true
      this.state.content = options.content || ''
      this.state.cancelText = options.cancelText || '取消'
      this.state.confirmText = options.confirmText || '确定'

      this.state.onConfirm = async () => {
        try {
          if (options.onConfirm) {
            await options.onConfirm()
          }
          this.hide()
          resolve(true)
        } catch (error) {
          console.error('Dialog confirm error:', error)
          resolve(false)
        }
      }

      this.state.onCancel = () => {
        if (options.onCancel) {
          options.onCancel()
        }
        this.hide()
        resolve(false)
      }
    })
  }

  /**
   * 隐藏弹窗
   */
  hide() {
    this.state.visible = false
  }

  reset() {
    this.state.content = ''
    this.state.cancelText = '取消'
    this.state.confirmText = '确定'
    this.state.onConfirm = undefined
    this.state.onCancel = undefined
  }

  /**
   * 获取当前状态
   */
  getState() {
    return this.state
  }

  /**
   * 确认弹窗 - 简化版本
   */
  confirm(content: string, confirmText?: string): Promise<boolean> {
    return this.show({
      content,
      confirmText,
    })
  }

  /**
   * 警告弹窗 - 简化版本
   */
  alert(content: string): Promise<boolean> {
    return this.show({
      content,
      confirmText: '知道了',
    })
  }
}

// 创建全局实例
const globalDialog = new GlobalDialogManager()

// Vue 插件
export const GlobalDialogPlugin = {
  install(app: App) {
    // 将弹窗管理器挂载到全局属性
    app.config.globalProperties.$dialog = globalDialog
    // 提供全局方法
    app.provide('$dialog', globalDialog)
    // 注册到Taro
    Taro.globalDialog = globalDialog
  },
}

export default globalDialog
