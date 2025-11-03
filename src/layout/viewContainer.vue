<template>
  <view v-if="!hasError" class="h-full flex flex-col">
    <slot />
    <view v-if="isTab" class="tabHeight" />
    <view v-if="isNewIphone && !noPlace" class="spacingIphone" />
  </view>
  <view v-else :class="styles.errorBox">
    <image :src="images.error" :class="styles.error" />
    <view :class="styles.retry" @click="() => handleRetry()">Retry</view>
  </view>
</template>

<script setup lang="ts">
import { defineProps, onErrorCaptured, ref } from 'vue'
import images from '~/assets/icon-image/images'
import { getisNewIphone } from '~/utils/help'
import styles from './index.module.less'

defineProps({
  // 底部是否需要垫高
  noPlace: {
    type: Boolean,
    default: false,
  },
  // 是否显示骨架屏
  loading: {
    type: Boolean,
    default: false,
  },
  // 是否是tab页,设置为tab页面。会额外提供一个tabbar的高度
  isTab: {
    type: Boolean,
    default: false,
  },
})

const isNewIphone = ref(getisNewIphone())
const hasError = ref(false)

const handleRetry = () => {
  window.location.reload()
}

onErrorCaptured((err, instance, info) => {
  console.error('Error captured in ErrorBoundary:', err, instance, info)
  hasError.value = true
  return false
})
</script>
