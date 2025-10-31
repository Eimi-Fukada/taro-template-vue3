/** @type {import('tailwindcss').Config} */
module.exports = {
  // 这里给出了一份 taro 通用示例，具体要根据你自己项目的目录结构进行配置
  // 比如你使用 vue3 项目，你就需要把 vue 这个格式也包括进来
  // 不在 content glob 表达式中包括的文件，在里面编写 tailwindcss class，是不会生成对应的 css 工具类的
  content: ['./public/index.html', './src/**/*.{html,js,ts,jsx,tsx,vue}'],
  // 其他配置项 ...
  corePlugins: {
    // 小程序不需要 preflight，因为这主要是给 h5 的，如果你要同时开发多端，你应该使用 process.env.TARO_ENV 环境变量来控制它
    preflight: false,
    // 在小程序端禁用某些不支持的 CSS 特性
    transform: process.env.TARO_ENV === 'h5',
    backdropBlur: process.env.TARO_ENV === 'h5',
  },
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color, #ff852c)',
        'primary-bg': 'var(--primary-bg-color, #ebf8ff)',
        'primary-loading':
          'var(--primary-loading-bg-color, rgba(14, 161, 235, 0.3))',

        // 功能色
        link: 'var(--link-color, #1890ff)',
        success: 'var(--success-color, #52c41a)',
        warning: 'var(--warning-color, #faad14)',
        error: 'var(--error-color, #f5222d)',

        // 文本色
        heading: 'var(--heading-color, #74A7F8)',
        text: 'var(--text-color, #ffffff)',
        'text-secondary': 'var(--text-color-secondary, rgba(0, 0, 0, 0.45))',
        disabled: 'var(--disabled-color, rgba(0, 0, 0, 0.25))',

        // 边框色
        border: 'var(--border-color-base, #d9d9d9)',
      },
      // 字体大小 - 映射 theme.less 中的字体变量
      fontSize: {
        base: 'var(--font-size-base, 18px)',
      },
      // 圆角 - 映射 theme.less 中的圆角变量
      borderRadius: {
        base: 'var(--border-radius-base, 4px)',
      },
      // 阴影 - 映射 theme.less 中的阴影变量
      boxShadow: {
        base: 'var(--box-shadow-base, 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05))',
      },
      fontFamily: {
        'han-bold': [
          'Source Han Sans CN-Bold',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'WenQuanYi Micro Hei',
          'sans-serif',
        ],
        'han-medium': [
          'Source Han Sans CN-Medium',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'WenQuanYi Micro Hei',
          'sans-serif',
        ],
        'han-regular': [
          'Source Han Sans CN-Regular',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'WenQuanYi Micro Hei',
          'sans-serif',
        ],
        han: [
          'Source Han Sans CN-Regular',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'WenQuanYi Micro Hei',
          'sans-serif',
        ], // 默认字体
      },
    },
  },
  // plugins: [require('@tailwindcss/line-clamp')],
}
