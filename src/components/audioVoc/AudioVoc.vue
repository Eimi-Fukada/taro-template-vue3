<template>
  <view :class="styles.container">
    <image :src="metadata.coverImgUrl" :class="styles.courseImage" />
    <view :class="styles.title">
      {{ metadata.title }}
    </view>
    <view :class="styles.controls">
      <image
        :src="Left_minutes"
        :class="styles.minutes"
        class="btn-scale-fast"
        @tap="seekBackward"
      />
      <image
        :src="Left"
        :class="styles.nextPrev"
        class="btn-scale-fast"
        @tap="playPrevWithEmit"
      />
      <image
        :src="playbackState.isPlaying ? Pause : Play"
        :class="styles.play"
        class="btn-scale-fast"
        @tap="togglePlayPause"
      />
      <image
        :src="Right"
        :class="styles.nextPrev"
        class="btn-scale-fast"
        @tap="playNextWithEmit"
      />
      <image
        :src="Right_minutes"
        :class="styles.minutes"
        class="btn-scale-fast"
        @tap="seekForward"
      />
    </view>
    <!-- progress -->
    <view :class="styles['progress-bar']">
      <slider
        :style="{ margin: 0 }"
        :min="0"
        :max="metadata.totalDuration || 100"
        :value="displayValue"
        backgroundColor="#EEEEEE"
        activeColor="#FF852C"
        blockColor="#FF852C"
        :blockSize="14"
        trackSize="8"
        @change="handleSliderChange"
        @changing="handleChanging"
      />
      <view :class="styles['progress-time']">
        <view :class="styles.time">
          {{ formatTime(playbackState.currentTime) }}
        </view>
        <view :class="styles.time">
          {{ formatTime(metadata.totalDuration) }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import styles from './index.module.less'
import { imageOssUrl } from '~/config'
import { Slider } from '@tarojs/components'
import { useAudioStore } from '~/stores/useAudioStore'
import { computed, reactive } from 'vue'

// 定义事件
const emits = defineEmits<{
  'on-prev': []
  'on-next': []
}>()

const Left_minutes = `${imageOssUrl}/2025/11/27/6fca7abb8ed1458b983047a14f6507f7.png`
const Right_minutes = `${imageOssUrl}/2025/11/27/6bf3f5f8fbed4f1190ecf16a4e281074.png`
const Left = `${imageOssUrl}/2025/11/27/72981d3bbb1445d590cb54127995fae5.png`
const Right = `${imageOssUrl}/2025/11/27/2b3da85fe4e745d8b5f5e21db4222841.png`
const Pause = `${imageOssUrl}/2025/11/27/cd8d1c9d9d6b4d2395dd397f112a796d.png`
const Play = `${imageOssUrl}/2025/11/27/5b3ee370b4e74dd1a7d1e2642cd783b1.png`

const {
  dragging,
  playbackState,
  metadata,
  seekBackward,
  seekForward,
  togglePlayPause,
  playNext,
  playPrev,
  seekTo,
  setDragging,
} = useAudioStore()

const state = reactive({
  draggingValue: 0,
})

// 封装播放上一首和下一首的方法，并触发事件
const playPrevWithEmit = () => {
  playPrev()
  emits('on-prev')
}

const playNextWithEmit = () => {
  playNext()
  emits('on-next')
}

const displayValue = computed(() => {
  return dragging ? state.draggingValue : playbackState.currentTime
})

function handleChanging(e) {
  setDragging(true)
  state.draggingValue = e.detail.value
}

const handleSliderChange = (e) => {
  // 用户拖动结束后，跳转到指定位置
  setDragging(false)
  const seekTime = e.detail.value
  seekTo(seekTime)
}

const formatTime = (seconds: number): string => {
  // 处理无效输入
  if (isNaN(seconds) || seconds < 0) {
    return '00:00'
  }

  // 计算分钟和秒数
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  // 格式化为两位数
  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0')

  return `${formattedMinutes}:${formattedSeconds}`
}
</script>
