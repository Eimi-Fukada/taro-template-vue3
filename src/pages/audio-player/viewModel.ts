import { useRouter } from '@tarojs/taro'
import { onMounted, reactive } from 'vue'
import apis from '~/request'
import { ChapterDetail } from './type'
import { useAudioStore } from '~/stores/useAudioStore'

export const useViewModel = () => {
  const state = reactive({
    chapterDetail: {} as ChapterDetail,
  })

  const routerParams = useRouter()?.params
  const audioStore = useAudioStore()

  const getData = async () => {
    const [chapterDetail] = await Promise.all([
      apis.get['/course/app/chapter/{id}']({
        args: {
          id: routerParams?.id || '',
        },
      }),
    ])
    state.chapterDetail = chapterDetail?.data?.data as ChapterDetail
    // 这里开始播放，如果你需要在其他页面进入，可以把这里的逻辑抽出来，在需要播放的地方调用这个方法，其他的地方直接执行跳转即可
    await audioStore.playChapter(routerParams?.id || '')
  }

  onMounted(() => {
    getData()
  })

  return {
    state,
  }
}
