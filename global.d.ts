declare module '*.png'
declare module '*.gif'
declare module '*.jpg'
declare module '*.jpeg'
declare module '*.svg'
declare module '*.webp'
declare module '*.css'
declare module '*.less'
declare module '*.scss'
declare module '*.sass'
declare module '*.styl'

// eslint-disable-next-line no-unused-vars
declare const VUE_APP_ENV: 'dev' | 'test' | 'pre' | 'prod' | false

// eslint-disable-next-line no-unused-vars
declare const wx

declare namespace Taro {
  namespace navigateTo {
    interface Option {
      /**
       * 查询参数
       *
       * 会作为url的query拼接
       */
      params?: Record<string, unknown>
    }
  }

  namespace redirectTo {
    interface Option {
      /**
       * 查询参数
       *
       * 会作为url的query拼接
       */
      params?: Record<string, unknown>
    }
  }

  // 全局弹窗管理器类型声明
  interface GlobalDialogManager {
    /**
     * 显示弹窗
     */
    show(options: {
      content?: string
      cancelText?: string
      confirmText?: string
      onConfirm?: () => void | Promise<void>
      onCancel?: () => void
    }): Promise<boolean>

    /**
     * 隐藏弹窗
     */
    hide(): void

    /**
     * 重置弹窗状态
     */
    reset(): void

    /**
     * 确认弹窗 - 简化版本
     */
    confirm(content: string, confirmText?: string): Promise<boolean>

    /**
     * 警告弹窗 - 简化版本
     */
    alert(content: string): Promise<boolean>

    /**
     * 获取当前状态
     */
    getState(): {
      visible: boolean
      content: string
      confirmText: string
      onConfirm?: () => void | Promise<void>
      onCancel?: () => void
    }
  }

  // 扩展Taro静态类，添加globalDialog属性
  interface TaroStatic {
    globalDialog: GlobalDialogManager
  }
}

declare module '@tarojs/components' {
  export * from '@tarojs/components/types/index.vue3'
}
