<template>
  <view :class="styles.Navigation" :style="{ height: rootHeight }">
    <view :class="styles.fixed" :style="{ paddingTop: contentPaddingTop }">
      <view :class="styles.content" :style="{ height: stateHeigth }">
        <!-- 左边 -->
        <view
          v-if="canShowLeftIcon"
          :class="styles.goback"
          @click="hanldeNavBack"
        >
          <image :src="images.left" :class="styles.leftIcon" />
        </view>
        <view :class="styles.title">
          {{ title }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro, {
  getCurrentPages,
  getMenuButtonBoundingClientRect,
  getSystemInfoSync,
} from '@tarojs/taro'
import styles from './index.module.less'
import images from '~/assets/icon-image/images'
import type { NavigationProps } from './types'

// Props 定义
const {
  title = '',
  backVisible = true,
  place = true,
} = defineProps<NavigationProps>()

const isWeapp = process.env.TARO_ENV === 'weapp'
// h5暂时不支持 API getMenuButtonBoundingClientRect, 模拟导航栏iphone6/7/8固定高度
const statusBarHeight = isWeapp ? getSystemInfoSync().statusBarHeight || 20 : 20

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
const canShowLeftIcon = ref(backVisible && getCurrentPages().length > 1)

function hanldeNavBack() {
  Taro.navigateBack({ delta: 1 })
}
</script>
