<template>
  <view :class="styles.Navigation" :style="{ height: rootHeight + 'px' }">
    <view
      :class="styles.fixed"
      :style="{
        paddingTop: contentPaddingTop + 'px',
        backgroundColor: bgColor
          ? bgColor
          : `rgba(255, 255, 255, ${bgOpacity})`,
      }"
    >
      <view :class="styles.content" :style="{ height: stateHeigth + 'px' }">
        <!-- 左边 -->
        <view
          v-if="canShowLeftIcon"
          :class="styles.goback"
          @click="hanldeNavBack"
        >
          <image :src="images.left" :class="styles.leftIcon" />
        </view>
        <view v-else :class="styles.goback" @click="hanldeNavHome">
          <image :src="images.home" :class="styles.leftIcon" />
        </view>
        <!-- 左侧内容插槽 -->
        <view v-if="slots.left" :class="styles.leftSlot">
          <slot name="left"></slot>
        </view>
        <view :class="styles.title">
          {{ title }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'
import Taro, {
  getCurrentPages,
  getMenuButtonBoundingClientRect,
  getWindowInfo,
} from '@tarojs/taro'
import styles from './index.module.less'
import images from '~/assets/icon-image/images'
import type { NavigationProps } from './types'

// Props 定义
const {
  title = '',
  backVisible = true,
  place = true,
  bgOpacity = 1,
  bgColor,
} = defineProps<NavigationProps>()

const slots = useSlots()
const hasLeftSlotContent = computed(() => !!slots.left)

const isWeapp = process.env.TARO_ENV === 'weapp'
// h5暂时不支持 API getMenuButtonBoundingClientRect, 模拟导航栏iphone6/7/8固定高度
const statusBarHeight = isWeapp ? getWindowInfo().statusBarHeight || 20 : 20

const menuButtonBoundingClientRect = isWeapp
  ? getMenuButtonBoundingClientRect()
  : {
      bottom: 56,
      height: 32,
      left: 278,
      right: 365,
      top: 24,
      width: 87,
    }

const stateHeigth =
  (menuButtonBoundingClientRect.top - statusBarHeight) * 2 +
  menuButtonBoundingClientRect.height

const navigationHeight = isWeapp ? stateHeigth + statusBarHeight : stateHeigth

const rootHeight = ref(!place ? 0 : navigationHeight)
const contentPaddingTop = ref(isWeapp ? statusBarHeight : 0)

const canShowLeftIcon = computed(
  () => backVisible && getCurrentPages().length > 1 && !hasLeftSlotContent.value
)

function hanldeNavBack() {
  Taro.navigateBack({ delta: 1 })
}
function hanldeNavHome() {
  Taro.reLaunch({ url: '/pages/index/index' })
}
</script>
