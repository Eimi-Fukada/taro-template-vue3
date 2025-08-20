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
  },
  theme: {
    extend: {
      colors: {
        // Add your custom colors
        'main-text': '#000000',
        'sub-text': '#28231B',
        'sub-text1': '#525459',
        'sub-text2': '#757880',
        'card-content': 'rgb(22,33,60)',
        'green-color': '#00B578',
        'yellow-color': '#FFB400',
        'gray-color': 'rgb(86,97,118)',
        'primary-color': '#0D5DFD',

        'placeholder-color': '#AFB3BE',
        'border-color': '#D1D4DA',
        'divider-color': '#EEEEEE',

        'main-bg': '#F5F5F5',
        'card-bg': '#FFFFFF',
        'tag-bg': '#E5EEFF', // 新增，标签背景色
        'tag-bg2': '#DEF7EF',
        'tag-bg3': '#E9EBEF',
        'tag-bg4': '#EBF4FF',
        'tag-bg5': '#DFF7F7',
        'tag-color': '#2DB1B5',

        // 长者照护服务页面专用颜色
        'elder-primary': '#003780', // 主要文字颜色
        'elder-secondary': '#757880', // 次要文字颜色
        'elder-gradient-start': '#e5ffeb', // 统计卡片渐变开始色
        'elder-gradient-end': '#e6f7ff', // 统计卡片渐变结束色
        'elder-icon-gradient-start': '#2db1b5', // 功能图标渐变开始色
        'elder-icon-gradient-end': '#41e8c6', // 功能图标渐变结束色

        // 新增健康数据相关颜色
        'red-danger': '#DC3545', // 红色危险色
        'green-success': '#00B578', // 绿色成功色
        'orange-light': '#FCECE8', // 浅橙色背景

        // 评估记录组件专用颜色
        'assessment-bg': '#e1f5f5',
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
  plugins: [require('@tailwindcss/line-clamp')],
}
