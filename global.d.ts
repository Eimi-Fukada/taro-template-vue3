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
}

declare module '@tarojs/components' {
  export * from '@tarojs/components/types/index.vue3'
}
