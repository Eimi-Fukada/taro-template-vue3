<template>
  <view :class="styles.container">
    <slot :timeData="timeData" :formattedTime="formattedTime">
      {{ formattedTime }}
    </slot>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import styles from './index.module.less'
import type { CountDownProps, CountDownEmits, TimeData } from './types'

const {
  time = 0,
  endTime,
  autoStart = true,
  format = 'HH:mm:ss',
  paused = false,
  millisecond = false,
} = defineProps<CountDownProps>()

// Emits 定义
const emits = defineEmits<CountDownEmits>()

// 响应式数据
const remainingTime = ref(0)
const isActive = ref(false)
const timer = ref<NodeJS.Timeout | null>(null)

// 计算初始剩余时间
const calculateRemainingTime = (): number => {
  if (endTime) {
    // 如果传入了结束时间戳，计算与当前时间的差值
    const now = Date.now()
    return Math.max(0, endTime - now)
  } else {
    // 如果传入的是秒数，转换为毫秒
    return time * 1000
  }
}

// 初始化剩余时间
remainingTime.value = calculateRemainingTime()

// 计算时间数据
const timeData = computed((): TimeData => {
  const total = Math.max(0, remainingTime.value)

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((total % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((total % (1000 * 60)) / 1000),
    milliseconds: Math.floor(total % 1000),
    totalSeconds: Math.floor(total / 1000), // 总秒数
  }
})

// 格式化时间显示
const formattedTime = computed(() => {
  const { days, hours, minutes, seconds, milliseconds } = timeData.value

  return format
    .replace('DD', String(days).padStart(2, '0'))
    .replace('HH', String(hours).padStart(2, '0'))
    .replace('mm', String(minutes).padStart(2, '0'))
    .replace('ss', String(seconds).padStart(2, '0'))
    .replace('SSS', String(milliseconds).padStart(3, '0'))
})

// 开始倒计时
const start = () => {
  if (isActive.value || remainingTime.value <= 0) return

  isActive.value = true
  const interval = millisecond ? 10 : 1000 // 毫秒模式10ms更新，否则1秒更新
  const step = millisecond ? 10 : 1000

  timer.value = setInterval(() => {
    if (endTime) {
      // 时间戳模式：重新计算剩余时间
      const now = Date.now()
      remainingTime.value = Math.max(0, endTime - now)
    } else {
      // 倒计时模式：递减时间
      remainingTime.value = Math.max(0, remainingTime.value - step)
    }

    emits('on-change', timeData.value)

    if (remainingTime.value <= 0) {
      stop()
      emits('on-finish')
    }
  }, interval)
}

// 停止倒计时
const stop = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  isActive.value = false
}

// 暂停倒计时
const pause = () => {
  stop()
  emits('on-pause')
}

// 重置倒计时
const reset = () => {
  stop()
  remainingTime.value = calculateRemainingTime()
}

// 重启倒计时
const restart = () => {
  reset()
  start()
  emits('on-restart')
}

// 监听暂停状态
watchEffect(() => {
  if (paused && isActive.value) {
    pause()
  }
})

// 监听 props 变化，重新计算剩余时间
watchEffect(() => {
  // 只监听 time 和 endTime 的变化，不监听 remainingTime
  const newRemainingTime = calculateRemainingTime()

  // 只有在非活动状态且时间真正变化时才更新
  if (!isActive.value && newRemainingTime !== remainingTime.value) {
    // 如果当前已经是0且新计算的时间也是基于相同参数，则不重启
    if (remainingTime.value === 0 && newRemainingTime === time * 1000) {
      return
    }
    remainingTime.value = newRemainingTime
  }
})

// 暴露方法给父组件
defineExpose({
  start,
  stop,
  pause,
  reset,
  restart,
})

onMounted(() => {
  if (autoStart && remainingTime.value > 0) {
    start()
  }
})

onBeforeUnmount(() => {
  stop()
})
</script>
