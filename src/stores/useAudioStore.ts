// stores/useAudioStore.ts
import { defineStore } from 'pinia'
import { ref, reactive, computed, watch, nextTick } from 'vue'
import Taro from '@tarojs/taro'
import apis from '~/request'
import { HttpStatus } from '~/request/enum'
import { ChapterDetail } from '~/pages/audio-player/type'

export enum AudioPlayErrorCode {
  /** 需要付费 */
  NEED_PAY = HttpStatus.chapter_code,
  /** 未知错误 */
  UNKNOWN_ERROR = HttpStatus.server_error,
}

// 播放模式
export type PlayMode = 'single' | 'loop' | 'random'

// 播放列表状态
interface PlaylistState {
  playableIds: string[] // 可播放的章节ID列表
  currentPlayingId: string // 当前播放的章节ID
  currentIndex: number // 当前在列表中的索引
  playMode: PlayMode // 播放模式
}

// 音频元数据
interface AudioMetadata {
  title: string // 当前章节标题
  coverImgUrl: string // 封面图
  totalDuration: number // 总时长
  chapterId: string // 章节ID
  courseId: number // 课程ID
}

// 播放控制状态
interface PlaybackState {
  isPlaying: boolean // 是否正在播放
  isLoading: boolean // 是否正在加载
  currentTime: number // 当前播放位置
  playbackRate: number // 播放速度
  volume: number // 音量
  // 新增错误状态
  lastError: {
    code?: AudioPlayErrorCode
    message?: string
  }
}

export const useAudioStore = defineStore('audio', () => {
  // BackgroundAudioManager实例（全局唯一）
  const audioManager = ref<Taro.BackgroundAudioManager | null>(null)

  // 播放列表状态
  const playlistState = reactive<PlaylistState>({
    playableIds: [],
    currentPlayingId: '',
    currentIndex: -1,
    playMode: 'loop',
  })

  // 音频元数据
  const metadata = reactive<AudioMetadata>({
    title: '',
    coverImgUrl: '',
    totalDuration: 0,
    chapterId: '',
    courseId: 0,
  })

  // 播放控制状态
  const playbackState = reactive<PlaybackState>({
    isPlaying: false,
    isLoading: false,
    currentTime: 0,
    playbackRate: 1.0,
    volume: 1.0,
    lastError: {},
  })

  // 进度条拖动状态
  const dragging = ref(false)

  // 计算属性
  const hasNext = computed(() => {
    if (playlistState.playableIds.length === 0) return false
    return (
      playlistState.playMode !== 'single' ||
      playlistState.currentIndex < playlistState.playableIds.length - 1
    )
  })

  const hasPrev = computed(() => {
    if (playlistState.playableIds.length === 0) return false
    return playlistState.playMode !== 'single' || playlistState.currentIndex > 0
  })

  // 解决拖动闪烁卡顿的问题
  const setDragging = (val: boolean) => {
    dragging.value = val
  }

  /**
   * 初始化BackgroundAudioManager
   */
  const init = () => {
    if (audioManager.value) return

    audioManager.value = Taro.getBackgroundAudioManager()

    // 绑定事件监听器
    bindAudioEvents()

    // 恢复播放状态
    restorePlaybackState()
  }

  /**
   * 绑定音频事件监听器
   * 优化点：
   * 1. onTimeUpdate 只在非拖动状态更新 currentTime
   * 2. 使用宏任务 nextTick 处理 duration 避免冲突
   */
  const bindAudioEvents = () => {
    const manager = audioManager.value
    if (!manager) return

    // 可以播放事件
    manager.onCanplay(() => {
      playbackState.isLoading = false
      // nextTick 确保 duration 更新后渲染
      nextTick(() => {
        metadata.totalDuration = manager.duration
      })
    })

    // 播放开始事件
    manager.onPlay(() => {
      // ❗如果当前因为下一首失败导致 lastError 存在
      // 那么不允许继续播放
      if (playbackState.lastError.message) {
        manager.pause()
        return
      }

      playbackState.isPlaying = true
    })

    // 暂停事件
    manager.onPause(() => {
      playbackState.isPlaying = false
    })

    // 停止事件
    manager.onStop(() => {
      playbackState.isPlaying = false
      savePlaybackState() // ✅ 保存停止的进度
    })

    // 播放结束事件
    manager.onEnded(() => {
      playbackState.isPlaying = false

      // 如果上一阶段出现错误，中断 onEnded 的正常行为
      if (playbackState.lastError.message) return

      // 获取下一首ID
      const nextId = getNextId()
      if (nextId) {
        // 不直接播放，而是先获取下一章节的URL和详情
        prepareNextChapter(nextId)
      }
    })

    // 时间更新事件，拖动状态下防止触发页面组件重新渲染
    manager.onTimeUpdate(async () => {
      if (!dragging.value) {
        playbackState.currentTime = manager.currentTime
      }
      // 初始化总时长
      if (!metadata.totalDuration && manager.duration) {
        nextTick(() => {
          // 防止某些播放器可能延迟获取 duration
          metadata.totalDuration = manager.duration || metadata.totalDuration
        })
      }

      // ⭐进入“即将结束”逻辑（剩余 <= 1s）
      const remain = metadata.totalDuration - manager.currentTime
      if (remain <= 1) {
        const nextId = getNextId()
        // 如果已经有错误（如下一首失败），避免重复执行
        if (!nextId || playbackState.lastError.message) return

        const playUrlResult = await fetchPlayUrl(nextId)

        // ❗下一首不可播 → 不让进入 onEnded → 卡在最后一秒 + 暂停
        if (!playUrlResult.success && playbackState.isPlaying) {
          // 不切歌、不触发 onEnded 播放逻辑
          manager.pause()
          return
        }
        // 下一首可以播放，交给 onEnded 去正常切歌
      }
    })

    // 错误事件
    manager.onError(() => {
      playbackState.isLoading = false
      playbackState.isPlaying = false
      playbackState.lastError = {
        code: AudioPlayErrorCode.UNKNOWN_ERROR,
        message: '播放错误',
      }
      console.error('背景音频播放错误')
    })

    // 用户点击下一曲事件
    manager.onNext(() => {
      const nextId = getNextId()
      if (nextId) {
        prepareNextChapter(nextId)
      }
    })

    // 用户点击上一曲事件
    if (manager.onPrev) {
      manager.onPrev(() => {
        const prevId = getPrevId()
        if (prevId) {
          playChapter(prevId)
        }
      })
    }

    // 用户点击停止事件
    if (manager.onStop) {
      manager.onStop(() => {
        stop()
      })
    }
  }

  /**
   * 设置播放列表
   */
  const setPlaylist = (playableIds: string[], currentId: string) => {
    playlistState.playableIds = playableIds
    playlistState.currentPlayingId = currentId
    playlistState.currentIndex = playableIds.findIndex((id) => id === currentId)

    // 保存到本地存储
    savePlaylistState()
  }

  /**
   * 获取下一首ID
   */
  const getNextId = () => {
    if (playlistState.playableIds.length === 0) return null

    const nextIndex =
      (playlistState.currentIndex + 1) % playlistState.playableIds.length
    return playlistState.playableIds[nextIndex]
  }

  /**
   * 获取上一首ID
   */
  const getPrevId = () => {
    if (playlistState.playableIds.length === 0) return null

    const prevIndex =
      playlistState.currentIndex <= 0
        ? playlistState.playableIds.length - 1
        : playlistState.currentIndex - 1
    return playlistState.playableIds[prevIndex]
  }

  /**
   * 获取章节播放URL
   */
  const fetchPlayUrl = async (chapterId: string) => {
    try {
      playbackState.isLoading = true
      playbackState.lastError = {}

      const response = await apis.get['/course/app/chapter/playUrl/{id}']({
        args: { id: chapterId },
      })

      if (response?.data?.code !== HttpStatus.success) {
        if (response?.data?.code === AudioPlayErrorCode.NEED_PAY) {
          playbackState.lastError = {
            code: AudioPlayErrorCode.NEED_PAY,
            message: response.data.msg,
          }
        } else {
          playbackState.lastError = {
            code: AudioPlayErrorCode.UNKNOWN_ERROR,
            message: response?.data?.msg || '获取播放地址失败',
          }
        }
        return { success: false, ...playbackState.lastError }
      }

      return {
        success: true,
        playUrl: response?.data?.data?.playUrl,
      }
    } catch (error) {
      console.error('获取播放URL失败:', error)
      playbackState.lastError = {
        code: AudioPlayErrorCode.UNKNOWN_ERROR,
        message: '网络错误，请检查网络连接',
      }
      return {
        success: false,
      }
    } finally {
      playbackState.isLoading = false
    }
  }

  /**
   * 获取章节详情
   */
  const fetchChapterDetail = async (chapterId: string) => {
    try {
      const response = await apis.get['/course/app/chapter/{id}']({
        args: { id: chapterId },
      })

      return response?.data?.data
    } catch (error) {
      console.error('获取章节详情失败:', error)
      return null
    }
  }

  /**
   * 准备下一章节（获取URL和详情）
   */
  const prepareNextChapter = async (nextChapterId: string) => {
    try {
      // 先获取URL，检查是否可播放
      const playUrlResult = await fetchPlayUrl(nextChapterId)

      if (playUrlResult.success) {
        // 如果URL获取成功，播放下一章节
        await updateChapterAndPlay(nextChapterId, playUrlResult.playUrl || '')
      }
    } catch (error) {
      console.error('准备下一章节出错:', error)
    }
  }

  /**
   * 播放指定章节
   */
  const playChapter = async (chapterId: string) => {
    // 1. 获取播放URL
    const playUrlResult = await fetchPlayUrl(chapterId)

    if (!playUrlResult.success) {
      // 如果正在播放，暂停
      if (playbackState.isPlaying && audioManager.value) {
        audioManager.value.pause()
      }
      return { success: false, errorCode: playbackState.lastError.code }
    }

    // 2. 获取章节详情并更新播放器
    const success = await updateChapterAndPlay(
      chapterId,
      playUrlResult.playUrl || ''
    )
    return { success }
  }

  /**
   * 更新章节信息并播放
   * 提取公共逻辑，避免重复代码
   */
  const updateChapterAndPlay = async (chapterId: string, playUrl: string) => {
    try {
      // 1. 获取章节详情
      const chapterDetail = (await fetchChapterDetail(
        chapterId
      )) as ChapterDetail

      // 2. 更新当前播放ID和元数据
      playlistState.currentPlayingId = chapterId
      playlistState.currentIndex = playlistState.playableIds.findIndex(
        (id) => id === chapterId
      )
      metadata.title = chapterDetail?.title || ''
      metadata.coverImgUrl = chapterDetail?.courseImageUrl || ''
      metadata.chapterId = chapterId
      metadata.courseId = chapterDetail.courseId

      // 3. 设置音频源并播放
      const manager = audioManager.value
      if (manager) {
        manager.title = metadata.title
        manager.coverImgUrl = metadata.coverImgUrl
        manager.src = playUrl
        // 设置src后会自动开始播放
      }

      // 4. 保存状态
      savePlaybackState()

      return true
    } catch (error) {
      console.error('更新章节信息失败:', error)
      return false
    }
  }

  /**
   * 播放/暂停切换
   */
  const togglePlayPause = () => {
    if (!audioManager.value) return

    if (playbackState.isPlaying) {
      audioManager.value.pause()
    } else {
      audioManager.value.play()
    }
  }

  /**
   * 下一首
   */
  const playNext = async () => {
    const nextId = getNextId()
    if (nextId) {
      prepareNextChapter(nextId)
    }
  }

  /**
   * 上一首
   */
  const playPrev = async () => {
    const prevId = getPrevId()
    if (prevId) {
      playChapter(prevId)
    }
  }

  /**
   * 快进15秒
   */
  const seekForward = () => {
    if (!audioManager.value || !metadata.totalDuration) return

    const newTime = Math.min(
      playbackState.currentTime + 15,
      metadata.totalDuration
    )
    seekTo(newTime)
  }

  /**
   * 快退15秒
   */
  const seekBackward = () => {
    if (!audioManager.value || !metadata.totalDuration) return

    const newTime = Math.max(playbackState.currentTime - 15, 0)
    seekTo(newTime)
  }

  /**
   * 跳转到指定位置
   */
  const seekTo = (position: number) => {
    if (!audioManager.value) return

    const manager = audioManager.value
    manager.seek(position)
    savePlaybackState() // ✅ 立即保存
  }

  /**
   * 设置播放速度
   */
  const setPlaybackRate = (rate: number) => {
    if (rate < 0.5 || rate > 2.0) return
    playbackState.playbackRate = rate

    if (audioManager.value) {
      audioManager.value.playbackRate = rate
    }
  }

  /**
   * 设置音量
   */
  const setVolume = (volume: number) => {
    if (volume < 0 || volume > 1) return
    playbackState.volume = volume

    // BackgroundAudioManager不支持音量控制，这里只记录状态
    // 实际音量控制需要系统设置或使用InnerAudioContext
  }

  /**
   * 切换播放模式
   */
  const togglePlayMode = () => {
    const modes: PlayMode[] = ['single', 'loop', 'random']
    const currentIndex = modes.indexOf(playlistState.playMode)
    const nextIndex = (currentIndex + 1) % modes.length
    playlistState.playMode = modes[nextIndex]

    savePlaylistState()
  }

  /**
   * 停止播放
   */
  const stop = () => {
    if (!audioManager.value) return
    audioManager.value.stop()
  }

  /**
   * 保存播放列表状态
   */
  const savePlaylistState = () => {
    Taro.setStorageSync('audioPlaylist', {
      playableIds: playlistState.playableIds,
      currentPlayingId: playlistState.currentPlayingId,
      currentIndex: playlistState.currentIndex,
      playMode: playlistState.playMode,
    })
  }

  /**
   * 保存播放进度
   */
  const savePlaybackState = () => {
    Taro.setStorageSync('audioPlayback', {
      currentTime: playbackState.currentTime,
      totalDuration: metadata.totalDuration,
      title: metadata.title,
      coverImgUrl: metadata.coverImgUrl,
      chapterId: metadata.chapterId,
    })
  }

  /**
   * 恢复播放状态
   */
  const restorePlaybackState = () => {
    try {
      // 恢复播放列表
      const playlistStateSaved = Taro.getStorageSync('audioPlaylist')
      if (playlistStateSaved) {
        playlistState.playableIds = playlistStateSaved.playableIds || []
        playlistState.currentPlayingId =
          playlistStateSaved.currentPlayingId || ''
        playlistState.currentIndex = playlistStateSaved.currentIndex || 0
        playlistState.playMode = playlistStateSaved.playMode || 'loop'
      }

      // 恢复播放进度
      const playbackStateSaved = Taro.getStorageSync('audioPlayback')
      if (playbackStateSaved) {
        playbackState.currentTime = playbackStateSaved.currentTime || 0
        metadata.totalDuration = playbackStateSaved.totalDuration || 0
        metadata.title = playbackStateSaved.title || ''
        metadata.coverImgUrl = playbackStateSaved.coverImgUrl || ''
        metadata.chapterId = playbackStateSaved.chapterId || ''
      }
    } catch (error) {
      console.error('恢复播放状态失败:', error)
    }
  }

  // 主动清除 lastError 状态，防止lastError 被设置后，不清除 → 播放器永久禁止播放
  const clearError = () => {
    playbackState.lastError = {}
  }

  // 自动保存播放进度
  let lastSavedTime = 0
  watch(
    () => playbackState.currentTime,
    (currentTime) => {
      const now = Date.now()
      // 每隔5秒保存一次，或者播放接近结束时也保存
      if (now - lastSavedTime > 5000 || currentTime >= metadata.totalDuration) {
        savePlaybackState()
        lastSavedTime = now
      }
    }
  )

  return {
    // 状态
    playlistState,
    metadata,
    playbackState,
    audioManager,
    dragging,

    // 计算属性
    hasNext,
    hasPrev,

    // 方法
    init,
    setPlaylist,
    playChapter,
    prepareNextChapter,
    togglePlayPause,
    playNext,
    playPrev,
    seekForward,
    seekBackward,
    seekTo,
    setPlaybackRate,
    setVolume,
    togglePlayMode,
    stop,
    savePlaybackState,
    setDragging,
    clearError,
  }
})
