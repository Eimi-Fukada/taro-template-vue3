<template>
  <view
    :class="[styles.Modal, open ? styles.Modal__center : styles.Modal__hide]"
    :style="[getModalStyle()]"
  >
    <view
      v-if="mask"
      :class="styles.Modal_mask"
      catch-move
      @tap="handleClick"
    />
    <view :class="styles.Modal_content" catch-move>
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

const handleClick = () => {
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
