<template>
  <movable-area :class="styles.movable_area" id="global-audio-wrapper">
    <movable-view
      direction="all"
      :class="styles.movable_view"
      :x="position.x"
      :y="position.y"
      :outOfBounds="false"
      :inertia="true"
    >
      <view :class="styles.content">
        <image :src="url" :class="[styles.courseImage, styles.slowerRotate]" />
        <image :src="images.pause" :class="styles.audioIcon" />
        <!-- <image :src="images.play" :class="styles.audioIcon" /> -->
        <image :src="images.audioClose" :class="styles.audioClose" />
      </view>
    </movable-view>
  </movable-area>
</template>

<script setup lang="ts">
import { MovableArea, MovableView } from '@tarojs/components'
import styles from './index.module.less'
import images from '~/assets/icon-image/images'
import { onMounted, ref } from 'vue'
import Taro from '@tarojs/taro'

const url =
  'https://img12.360buyimg.com/imagetools/jfs/t1/196430/38/8105/14329/60c806a4Ed506298a/e6de9fb7b8490f38.png'

const position = ref({
  x: 200,
  y: 600,
})

onMounted(() => {
  const windowInfo = Taro.getWindowInfo()
  const { screenWidth, screenHeight } = windowInfo
  position.value = {
    x: screenWidth - 166,
    y: screenHeight - 140,
  }
})
</script>
