import { onMounted, reactive } from 'vue'
import Taro from '@tarojs/taro'
export const useViewModel = () => {
  const state = reactive({
    // 你的响应式状态和数据
    count: 0,
  })

  const handleBack = () => {
    const eventChannel = Taro.getCurrentInstance().page?.getOpenerEventChannel
    if (eventChannel) {
      // 保存成功后通知上一个页面，向上一个页面发送数据（这会触发你的 acceptDataFromIndexPage 事件）
      eventChannel().emit('acceptDataFromOpenedPage', {
        data: 'test',
      })
    }
    Taro.navigateBack()
  }

  onMounted(() => {
    // 获取页面间通信的 eventChannel 对象
    const eventChannel = Taro.getCurrentInstance().page?.getOpenerEventChannel

    if (eventChannel) {
      // 监听来自上一个页面的数据
      eventChannel().on('acceptDataFromOpenedPage', (data) => {
        console.log('收到上一个页面数据:', data)
      })
    }
  })

  return {
    state,
    handleBack,
  }
}
