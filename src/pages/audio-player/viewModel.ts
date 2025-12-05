import { useRouter } from '@tarojs/taro'
import { onMounted, reactive, watch } from 'vue'
import apis from '~/request'
import { ChapterDetail } from './type'
import { useAudioStore } from '~/stores/useAudioStore'
import { HttpStatus } from '~/request/enum'

export const useViewModel = () => {
  const state = reactive({
    chapterDetail: {} as ChapterDetail,
  })

  const routerParams = useRouter()?.params
  const { playbackState, clearError, playChapter } = useAudioStore()
  const { globalDialog } = Taro

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
    await playChapter(routerParams?.id || '')
  }

  const handleLastError = (val) => {
    if (val?.code === HttpStatus.chapter_code) {
      globalDialog.show({
        content: '试听已结束，立即购买可解锁全部章节~',
        cancelText: '稍后再说',
        confirmText: '立即购买',
        onCancel: () => {
          clearError()
        },
        onConfirm: () => {
          globalDialog.hide()
          clearError()
        },
      })
    }
  }

  onMounted(() => {
    getData()
    handleLastError(playbackState.lastError)
  })

  watch(
    () => playbackState.lastError,
    (val) => {
      handleLastError(val)
    }
  )

  return {
    state,
  }
}
