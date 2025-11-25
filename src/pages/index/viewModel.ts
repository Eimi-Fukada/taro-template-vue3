import { reactive, onMounted, ref } from 'vue'
import Taro, { usePageScroll } from '@tarojs/taro'
import { FetchDataFunction, UsePaginationListReturn } from '~/components'
import apis from '~/request'
import { CoursesItemProps } from './type'

export const useViewModel = () => {
  const state = reactive({
    // 你的响应式状态和数据
    count: 0,
    scrollOpacity: 0,
  })

  const listRef = ref<UsePaginationListReturn>()

  const fetchData: FetchDataFunction<CoursesItemProps> = async (
    page,
    pageSize
  ) => {
    const { data } = await apis.get['/course/app/course/list']({
      data: { pageSize, pageNum: page },
    })

    return {
      list: data?.rows || [],
      total: data?.total || 0,
      hasMore: data?.hasNext || false,
    }
  }
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
  onMounted(() => {
    // 示例：获取首页数据
    listRef.value?.refresh()
  })

  return {
    state,
    increment,
    handleEventChannel,
    listRef,
    fetchData,
  }
}
