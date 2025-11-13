<template>
  <Mask
    :open="open"
    :mask-closable="false"
    position="center"
    @on-close="open = false"
  >
    <Transition name="slide">
      <view v-show="open" :class="styles.page">
        <view :class="styles.header">{{ title }}</view>
        <view :class="styles.content">
          <view :class="styles.text">
            {{ content }}
          </view>
          <view :class="styles.footer">
            <view :class="styles.cancel" @tap="onCancel" class="btn-scale-fast">
              {{ cancelText }}
            </view>
            <view
              :class="styles.confirm"
              @tap="onConfirm"
              class="btn-scale-fast"
            >
              {{ confirmText }}
            </view>
          </view>
        </view>
      </view>
    </Transition>
  </Mask>
</template>

<script setup lang="ts">
import styles from './index.module.less'
import { Mask } from '~/components'
import type { AlertProps, AlertEmits } from './types'

const open = defineModel<boolean>('open', {
  default: false,
})

const emits = defineEmits<AlertEmits>()

const {
  title = '提示',
  content,
  cancelText = '取消',
  confirmText = '确认',
} = defineProps<AlertProps>()

const onCancel = () => {
  open.value = false
  emits('on-cancel')
}

const onConfirm = () => {
  emits('on-confirm')
}
</script>
