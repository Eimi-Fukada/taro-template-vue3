import { reactive, onMounted } from 'vue'
import Taro, { usePageScroll } from '@tarojs/taro'

export const useViewModel = () => {
  const state = reactive({
    // 你的响应式状态和数据
    count: 0,
    scrollOpacity: 0,
  })

  const increment = () => {
    state.count++
  }
  const handleEventChannel = () => {
    Taro.navigateTo({
      url: '/pages/eventChannel/index',
      events: {
        acceptDataFromOpenedPage: function (data) {
          if (data) {
            console.log('来自eventChannel页面的数据', data)
          }
        },
      },
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        console.log('前往eventChannel页面', res.eventChannel)
        res.eventChannel.emit('acceptDataFromOpenedPage', { data: 'test' })
      },
    })
  }

  usePageScroll((res) => {
    state.scrollOpacity = Math.min(res.scrollTop / 100, 1)
  })

  // you can write your mounted function
  onMounted(() => {})

  return {
    state,
    increment,
    handleEventChannel,
  }
}
