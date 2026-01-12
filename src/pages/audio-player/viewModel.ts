import { useRouter, useShareAppMessage } from '@tarojs/taro'
import { onMounted, onUnmounted, reactive, watch } from 'vue'
import apis from '~/request'
import { ChapterDetail } from './type'
import { useAudioStore } from '~/stores/useAudioStore'
import { HttpStatus } from '~/request/enum'
import { useAudioFloatStore } from '~/stores/useAudioFloatStore'

export const useViewModel = () => {
  const state = reactive({
    chapterDetail: {} as ChapterDetail,
  })

  const routerParams = useRouter()?.params

  const { globalDialog } = Taro
  const { playbackState, clearError, playChapter, metadata, setPlaylist } =
    useAudioStore()
  const { hideForPage, showForPage } = useAudioFloatStore()

  const getData = async () => {
    const [chapterDetail] = await Promise.all([
      apis.get['/course/app/chapter/{id}']({
        args: {
          id: routerParams?.id || '',
        },
      }),
    ])
    state.chapterDetail = chapterDetail?.data?.data as ChapterDetail
    const playableIds = (chapterDetail?.data?.data || []).map((i) => i.id)
    // 这里开始播放，如果你需要在其他页面进入，可以把这里的逻辑抽出来，在需要播放的地方调用这个方法，其他的地方直接执行跳转即可，最好是放在这个页面，这样这个页面可以单独分享出去
    setPlaylist(playableIds, routerParams?.chapterId || '')
    await playChapter(routerParams?.id || '')
  }

  const handleLastError = (val) => {
    if (val?.code === HttpStatus.chapter_code) {
      globalDialog.show({
        content: '试听已结束，立即购买可解锁全部章节~',
        cancelText: '稍后再说',
        confirmText: '立即购买',
        // onCancel: () => {
        //   clearError()
        // },
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
    // 进入播放页：强制隐藏浮窗
    hideForPage()
  })

  watch(
    () => playbackState.lastError,
    (val) => {
      handleLastError(val)
    }
  )

  onUnmounted(() => {
    // 离开播放页：如果有播放中的音频，则显示浮窗，否则不显示
    if (playbackState.isPlaying) {
      showForPage()
    }
  })

  useShareAppMessage(() => {
    return {
      title: `${metadata.title}`,
      path: '/page/user?id=123',
      imageUrl: `${metadata.coverImgUrl}`,
    }
  })

  return {
    state,
  }
}
