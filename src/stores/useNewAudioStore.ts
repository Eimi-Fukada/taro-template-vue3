// stores/useNewAudioStore.ts
/**
 * 新的逻辑是如果下一章节需要付费，则需要停留在下一章节的头部，这种产品逻辑更主流，也更健康
 * 原因有三点：
 * 1. 符合用户心智
 * 用户点击「下一集」，预期是"进入下一集"，而不是被卡在上一集尾巴
 *喜马拉雅、得到、网易云知识付费课程，都是允许进入下一章但不播放
 * 2. 降低播放器复杂度
 * 不再需要「在尾部 1s 内做复杂判断」
 * 不再需要"尾部强制 pause"的 workaround
 * 3. 权限语义更清晰
 * 播放权限 ≠ 查看章节
 * 章节可以进入，但播放行为被拦截
 */
import { defineStore } from 'pinia'
import { ref, reactive, computed, watch, nextTick } from 'vue'
import Taro from '@tarojs/taro'
import apis from '~/request'
import { HttpStatus } from '~/request/enum'
import { ChapterDetail } from '~/pages/audio-player/type'
import { audioEventBus, AudioEvent } from '~/domain/audio/eventBus'

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
  playedDuration?: number // 添加已播放时长
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
    playedDuration: 0, // 添加已播放时长默认值
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
  // 是否需要重置播放位置，解决微信系统浮窗被关闭重新播放的问题
  const shouldResetPosition = ref(false)

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
    // ⭐ 注意：不在 init 阶段恢复断点，断点通过 playChapter 的 resumeFromRecord 恢复
    // restorePlaybackState()
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

      // 如果微信系统浮窗被关闭，则重置播放位置，浮窗关闭会走 onStop 事件, onWaiting 事件, 所以这里需要在 onPlay 事件中处理
      if (shouldResetPosition.value) {
        shouldResetPosition.value = false

        if (audioManager.value) {
          audioManager.value.seek(0)
          playbackState.currentTime = 0
        }
      }

      // ⭐ 广播播放事件（UI 可无侵入监听）
      audioEventBus.emit(AudioEvent.PLAY, {
        chapterId: metadata.chapterId,
        title: metadata.title,
        currentTime: playbackState.currentTime,
      })
    })

    // 暂停事件
    manager.onPause(() => {
      playbackState.isPlaying = false
      // 暂停时保存本地状态，但不上报服务器进度
      savePlaybackState()

      audioEventBus.emit(AudioEvent.PAUSE, {
        chapterId: metadata.chapterId,
        currentTime: playbackState.currentTime,
      })
    })

    // 停止事件
    manager.onStop(() => {
      shouldResetPosition.value = true
      playbackState.isPlaying = false
      // ✅ 保存停止的进度，停止也上报（可能是因为用户主动结束本章学习）
      updateProgressAndSaveState('heart_beat_event')

      audioEventBus.emit(AudioEvent.STOP)
    })

    // 播放结束事件
    manager.onEnded(() => {
      playbackState.isPlaying = false

      // ⭐ 如果有错误，不自动播放下一首
      if (playbackState.lastError.message) {
        console.error('播放结束但有错误，不自动播放下一首')
        return
      }

      // 获取下一首ID
      const nextId = getNextId()
      if (!nextId) return

      playChapter(nextId, false)
    })

    manager.onWaiting(() => {
      console.log('onWaiting')
    })

    // 时间更新事件，拖动状态下防止触发页面组件重新渲染
    manager.onTimeUpdate(async () => {
      if (!dragging.value) {
        playbackState.currentTime = manager.currentTime
      }

      // ⭐ 广播播放进度（不会阻塞播放）
      audioEventBus.emit(AudioEvent.TIME_UPDATE, {
        currentTime: manager.currentTime,
        duration: metadata.totalDuration,
      })
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

      audioEventBus.emit(AudioEvent.ERROR, {
        code: AudioPlayErrorCode.UNKNOWN_ERROR,
        message: '播放错误',
      })
    })

    // 用户点击下一曲事件
    manager.onNext(() => {
      audioEventBus.emit(AudioEvent.NEXT)

      playNext()
    })

    // 用户点击上一曲事件
    if (manager.onPrev) {
      manager.onPrev(() => {
        audioEventBus.emit(AudioEvent.PREV)

        playPrev()
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

    // 单曲循环模式
    if (playlistState.playMode === 'single') {
      return null
    }

    // 随机播放模式
    if (playlistState.playMode === 'random') {
      const ids = playlistState.playableIds.filter(
        (id) => id !== playlistState.currentPlayingId
      )
      return ids.length ? ids[Math.floor(Math.random() * ids.length)] : null
    }

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
  const fetchPlayUrl = async (
    chapterId: string,
    options?: { silent?: boolean }
  ) => {
    try {
      if (!options?.silent) {
        playbackState.isLoading = true
        playbackState.lastError = {}
      }

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

      // 添加 playedDuration 到返回值
      return {
        success: true,
        playUrl: response?.data?.data?.playUrl,
        playedDuration: response?.data?.data?.playedDuration || 0, // 获取已播放时长
      }
    } catch (error) {
      console.error('获取播放URL失败:', error)
      if (!options?.silent) {
        playbackState.lastError = {
          code: AudioPlayErrorCode.UNKNOWN_ERROR,
          message: '网络错误，请检查网络连接',
        }
      }
      return {
        success: false,
      }
    } finally {
      if (!options?.silent) {
        playbackState.isLoading = false
      }
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
   * 播放指定章节
   */
  const playChapter = async (
    chapterId: string,
    // ⭐ 默认从历史记录开始播放
    resumeFromRecord = true
  ) => {
    const manager = audioManager.value
    if (!manager) return

    clearError()

    shouldResetPosition.value = false

    // ⭐⭐⭐ 1：彻底打断上一首
    manager.stop()
    // ⭐⭐⭐ 2：等待微信内部状态完全 reset，防止在上一首音频尚未完成 canplay / 元数据初始化时，就切换到下一首，导致 BackgroundAudioManager 进入「半初始化态」
    await nextTick()

    // 1. 获取播放URL
    const playUrlResult = await fetchPlayUrl(chapterId)

    // 2. 获取章节详情并更新
    await updateChapter(chapterId)

    if (!playUrlResult.success) {
      // 如果正在播放，暂停
      if (playbackState.isPlaying) {
        manager.pause()
      }
      playbackState.isPlaying = false
      return { success: false, errorCode: playbackState.lastError.code }
    }

    // ✅ 只在这里计算恢复进度
    const resumeTime = resumeFromRecord ? playUrlResult.playedDuration ?? 0 : 0

    // ⭐ 核心：在任何异步之前就清空时间
    playbackState.currentTime = 0
    manager.startTime = 0

    // ✅ 先设置 src
    manager.src = playUrlResult.playUrl!
    // ✅ 第一次设置 src：系统可能自动播放，但页面返回后再次设置 src：系统不会自动播放，在设置 src 后调用
    manager.play()

    let pendingSeekTime = resumeTime

    // ✅ 关键：只在 canplay 后 seek
    const handleCanplay = () => {
      if (pendingSeekTime > 0) {
        manager.seek(pendingSeekTime)
        playbackState.currentTime = pendingSeekTime
        pendingSeekTime = 0
      }
    }

    // ✅ BackgroundAudioManager 在 src 被重新赋值时会重置内部状态，所以 startTime 在 src 之前或之后设置都不可靠，只有 onCanplay → seek() 是稳定生效点。
    manager.onCanplay(handleCanplay)

    audioEventBus.emit(AudioEvent.META_UPDATE, {
      title: metadata.title,
      cover: metadata.coverImgUrl,
      chapterId: metadata.chapterId,
      courseId: metadata.courseId,
      startTime: resumeFromRecord ? playUrlResult.playedDuration || 0 : 0,
      phase: 'play',
    })

    updateProgressAndSaveState('heart_beat_event')
    return { success: true }
  }

  // 只进入章节
  const updateChapter = async (chapterId: string) => {
    try {
      const chapterDetail = (await fetchChapterDetail(
        chapterId
      )) as ChapterDetail

      if (!chapterDetail) return null

      playlistState.currentPlayingId = chapterId
      playlistState.currentIndex = playlistState.playableIds.findIndex(
        (id) => id === chapterId
      )
      metadata.title = chapterDetail.title || ''
      metadata.coverImgUrl = chapterDetail.courseImageUrl || ''
      metadata.totalDuration = chapterDetail.totalDuration || 0
      metadata.chapterId = chapterDetail.chapterId
      metadata.courseId = chapterDetail.courseId

      const manager = audioManager.value
      if (manager) {
        manager.title = metadata.title
        manager.coverImgUrl = metadata.coverImgUrl
      }

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
      playChapter(nextId, false)
    }
  }

  /**
   * 上一首
   */
  const playPrev = async () => {
    const prevId = getPrevId()
    if (prevId) {
      playChapter(prevId, false)
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

    // ⭐ 广播 seek 结束
    audioEventBus.emit(AudioEvent.SEEK_END, {
      position,
    })
    updateProgressAndSaveState('drag_event')
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
    Taro.setStorageSync('audioPlaylist', { ...playlistState })
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
   * 更新学习进度和保存本地播放状态
   */
  const updateProgressAndSaveState = (
    eventType: 'drag_event' | 'heart_beat_event'
  ) => {
    // 1. 保存本地播放状态 - 保底
    savePlaybackState()

    // 2. 更新服务器学习进度
    if (
      metadata.chapterId &&
      metadata.courseId &&
      playbackState.isPlaying &&
      playbackState.currentTime > 1
    ) {
      updateLearningProgress(eventType)
    }
  }

  /**
   * 向服务器更新学习进度（心跳接口）
   */
  const updateLearningProgress = async (
    eventType: 'drag_event' | 'heart_beat_event'
  ) => {
    try {
      await apis.post['/course/app/chapter/updateLearningProgress']({
        data: {
          courseId: metadata.courseId,
          chapterId: metadata.chapterId,
          learnDuration: Math.floor(playbackState.currentTime), // 使用当前播放时长作为学习时长
          eventType: eventType, // 心跳事件, 拖动事件
        },
      })
    } catch (error) {
      console.error('更新学习进度失败:', error)
    }
  }

  /**
   * 恢复播放状态
   * 注意：当前未使用，断点续播通过 playChapter 的 resumeFromRecord 参数实现
   * 未来可能用于应用启动时的状态恢复或完全离线场景
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
        metadata.courseId = playbackStateSaved.courseId || ''
        metadata.playedDuration = playbackStateSaved.playedDuration || 0
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
        updateProgressAndSaveState('heart_beat_event')
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
    restorePlaybackState,
  }
})
