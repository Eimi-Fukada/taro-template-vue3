<template>
  <view
    :class="[styles.Modal, open ? styles.Modal__center : styles.Modal__hide]"
    :style="[getModalStyle()]"
  >
    <view
      v-if="mask"
      :class="styles.Modal_mask"
      catch-move
      @tap.stop="handleClick"
      @touchmove.stop.prevent="handleTouchMove"
    />
    <view :class="styles.Modal_content" @tap.stop>
      <slot />
    </view>
  </view>
</template>

<script setup lang="ts">
import styles from './index.module.less'
import type { MaskProps } from '~/components/mask/types'

// Props 定义
const {
  open = false,
  mask = true,
  maskClosable = false,
  position = 'center',
} = defineProps<MaskProps>()

// Emits 定义
const emits = defineEmits<{
  'on-close': []
}>()

const handleTouchMove = (e) => {
  // 阻止触摸移动事件冒泡和默认行为
  e.stopPropagation()
  e.preventDefault()
}

const handleClick = (event) => {
  event.stopPropagation()
  if (maskClosable) {
    emits('on-close')
  }
}

const getModalStyle = () => {
  if (position === 'center') {
    return {
      justifyContent: 'center',
    }
  } else if (position === 'bottom') {
    return {
      justifyContent: 'flex-end',
    }
  }
}
</script>
