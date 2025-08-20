<template>
  <view :class="styles.page">
    <view
      v-for="(item, index) in data"
      :key="item.value"
      :class="styles.content"
      @tap="handleChange(index)"
    >
      <view v-if="current === index" :class="styles.line" />
      <view :class="current === index ? styles.itemSelected : styles.item">
        {{ item.label }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import styles from './index.module.less'
import type { TabsProps } from '~/components/tabs/types'

// Props 定义
const { data = [] } = defineProps<TabsProps>()

// 使用 defineModel 实现双向绑定
const current = defineModel<number>('current', { default: 0 })

// Emits 定义
const emits = defineEmits<{
  'on-change': [index: number]
}>()

// 处理选项卡变化
const handleChange = (index: number) => {
  current.value = index
  emits('on-change', index)
}
</script>
