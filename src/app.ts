import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@nutui/nutui-taro/dist/style.css'
import { Skeleton } from '@nutui/nutui-taro'
import './app.less'
import { directiveMap } from './directives'

const App = createApp({
  onShow(_options) {},
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})

// 批量注册组件和插件
const plugins = [Skeleton, createPinia()]

plugins.forEach((plugin) => App.use(plugin))

// 注册指令
Object.entries(directiveMap).forEach(([name, directive]) => {
  App.directive(name, directive)
})

export default App
