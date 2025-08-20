<template>
  <view :class="styles.page">
    <textarea
      v-model="value"
      :class="styles.textarea"
      :auto-height="autoHeight"
      :maxlength="maxLength"
      :placeholder="placeholder"
      :style="{ height: relHeight, minHeight: `${minHeight}px` }"
    />
    <view :class="styles.showCount">{{ value.length }}/{{ maxLength }}</view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import styles from './index.module.less'
import type { TextAreaProps } from './types'

// Props 定义
const {
  placeholder = '请输入内容',
  maxLength = 100,
  height = 50,
  minHeight = 50,
  autoHeight = false,
} = defineProps<TextAreaProps>()

// 使用 defineModel 实现双向绑定
const value = defineModel<string>('value', { default: '' })

// 计算实际高度
const relHeight = computed(() => {
  if (autoHeight) {
    return 'auto'
  }
  return `${height}px`
})
</script>
