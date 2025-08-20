<template>
  <Mask
    :open="open"
    :mask-closable="maskClosable"
    position="bottom"
    @on-close="handleClose"
  >
    <Transition name="slide">
      <view v-show="open" :class="styles.page">
        <!-- 标题区域 -->
        <view v-if="title" :class="styles.header">
          <view :class="styles.title">{{ title }}</view>
          <view :class="styles.closeIcon" @tap="handleClose">
            <image :class="styles.closeImage" :src="images.close" />
          </view>
        </view>

        <!-- 内容区域 -->
        <view :class="styles.content">
          <!-- 默认操作项列表 -->
          <view v-if="items && items.length > 0" :class="styles.itemList">
            <view
              v-for="(item, index) in items"
              :key="item.id"
              :class="[
                styles.item,
                {
                  [styles.active]: current === index,
                  [styles.disabled]: item.disabled,
                },
              ]"
              :style="{ color: item.color }"
              @tap="handleItemClick(item, index)"
            >
              {{ item.name }}
            </view>
          </view>

          <!-- 自定义内容插槽，当没有items或items为空时显示 -->
          <slot v-else></slot>
        </view>

        <!-- 取消按钮 -->
        <view
          v-if="cancelText"
          :class="styles.cancelButton"
          @tap="handleCancel"
        >
          <view :class="styles.btn">
            {{ cancelText }}
          </view>
        </view>
      </view>
    </Transition>
  </Mask>
</template>

<script setup lang="ts">
import styles from './index.module.less'
import { Mask } from '~/components'
import type {
  ActionSheetProps,
  ActionSheetItem,
  ActionSheetEmits,
} from './types'
import images from '~/assets/icon-image/images'
import { ref } from 'vue'

const open = defineModel<boolean>('open', { default: false })
const current = ref<number>()

// Props 定义 - 直接解构，单向数据流不需要保持响应式
const {
  items,
  title,
  cancelText,
  maskClosable = true,
} = defineProps<ActionSheetProps>()

// Emits 定义
const emits = defineEmits<ActionSheetEmits>()

// 处理关闭
const handleClose = () => {
  open.value = false
  emits('on-close')
}

// 处理项目点击
const handleItemClick = (item: ActionSheetItem, index: number) => {
  if (item.disabled) return
  open.value = false
  current.value = index
  emits('on-choose', item, index)
}

// 处理取消按钮
const handleCancel = () => {
  open.value = false
  emits('on-cancel')
}
</script>
