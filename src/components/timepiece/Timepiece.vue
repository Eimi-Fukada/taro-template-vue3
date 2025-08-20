<template>
  <Mask :open="open">
    <view :class="styles.page">
      <view :class="styles.contain">
        <view :class="styles.title">测试计时</view>
        <view :class="styles.time">
          {{ formattedElapsedTime }}
        </view>
        <view :class="styles.btn">
          <view :class="styles.btnItem" @tap="resetTimer">
            <image
              :src="resetIcon"
              :class="styles.image"
              :style="
                isRunning || elapsedTime === 0
                  ? { opacity: 0.36 }
                  : { opacity: 1 }
              "
            />
            <view :class="styles.text">重置</view>
          </view>
          <view :class="styles.btnItem" @tap="toggleTimer">
            <image
              :src="isRunning ? pauseIcon : runIcon"
              :class="styles.image"
            />
            <view :class="styles.text">
              {{ isRunning ? '暂停' : '开始' }}
            </view>
          </view>
        </view>
      </view>
      <image :src="images.close" :class="styles.closeIcon" @tap="handleClose" />
    </view>
  </Mask>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import styles from './index.module.less'
import { Mask } from '~/components/mask'
import resetIcon from './images/reset.webp'
import runIcon from './images/run.webp'
import pauseIcon from './images/pause.webp'
import images from '~/assets/icon-image/images'
import type { TimepieceProps } from '~/components/timepiece/types'

// Props 定义
const { open = false } = defineProps<TimepieceProps>()

// Emits 定义
const emits = defineEmits<{
  'on-close': []
}>()

// 计时器状态
const startTime = ref<number | null>(null)
const timer = ref<number | null>(null)
const elapsedTime = ref<number>(0)
const isRunning = ref<boolean>(false)

// 关闭处理
const handleClose = () => {
  emits('on-close')
}

// 格式化显示时间
const formattedElapsedTime = computed(() => {
  const totalSeconds = Math.floor(elapsedTime.value / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const milliseconds = elapsedTime.value % 1000
  const formatMilliseconds =
    milliseconds < 10
      ? '0' + milliseconds.toString().slice(0, 2)
      : milliseconds.toString().slice(0, 2)

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${formatMilliseconds}`
})

// 开始计时
const startTimer = () => {
  if (!startTime.value) {
    startTime.value = Date.now()
  }
  isRunning.value = true
  timer.value = setInterval(() => {
    elapsedTime.value += 10
  }, 10) as unknown as number
}

// 暂停计时
const pauseTimer = () => {
  if (isRunning.value) {
    clearInterval(timer.value as number)
    timer.value = null
    isRunning.value = false
  }
}

// 重置计时
const resetTimer = () => {
  if (isRunning.value || elapsedTime.value === 0) {
    return
  }
  pauseTimer()
  startTime.value = null
  elapsedTime.value = 0
}

// 切换计时状态
const toggleTimer = () => {
  if (isRunning.value) {
    pauseTimer()
  } else {
    startTimer()
  }
}

// 组件卸载时清理计时器
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value as number)
    resetTimer()
  }
})
</script>
