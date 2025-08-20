<template>
  <view :class="styles.page">
    <!-- star -->
    <view :class="styles.starList">
      <image
        v-for="item in starList"
        :key="item"
        :src="item <= current ? images.star : images.unStar"
        :class="styles.star"
        @tap="handleClick(item)"
      />
    </view>
    <view :class="styles.desc">
      {{ descText }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import styles from './index.module.less'
import images from '~/assets/icon-image/images'
import type { StarLevelProps } from './types'

// Props 定义
const { disabled = false } = defineProps<StarLevelProps>()

// 使用 defineModel 实现双向绑定
const current = defineModel<number>('value', { default: 1 })

// 星级列表
const starList = Array.from({ length: 5 }, (_, index) => index + 1)

// 处理点击事件
const handleClick = (index: number) => {
  if (disabled) {
    return
  }
  current.value = index
}

// 根据当前星级计算描述文本
const descText = computed(() => {
  switch (current.value) {
    case 1:
      return '非常差'
    case 2:
      return '差'
    case 3:
      return '一般'
    case 4:
      return '好'
    case 5:
      return '非常好'
    default:
      return ''
  }
})
</script>
