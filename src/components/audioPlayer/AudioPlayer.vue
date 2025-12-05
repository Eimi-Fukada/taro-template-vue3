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
        <view
          :class="
            playbackState.isPlaying
              ? styles.bubbleEffect
              : styles['image-container']
          "
        >
          <image
            :src="metadata.coverImgUrl"
            :class="[
              styles.courseImage,
              { [styles.slowerRotate]: playbackState.isPlaying },
            ]"
            @tap="handleToPlay"
          />
        </view>
        <image
          :src="playbackState.isPlaying ? images.pause : images.play"
          :class="styles.audioIcon"
          @tap="togglePlayPause"
        />
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
import { useAudioStore } from '~/stores/useAudioStore'

const { playlistState, playbackState, metadata, togglePlayPause } =
  useAudioStore()

const position = ref({
  x: 200,
  y: 600,
})

const handleToPlay = () => {
  // 直接进入播放
  Taro.navigateTo({
    url: `/pages/audio-player/index?id=${playlistState.currentPlayingId}`,
  })
}

onMounted(() => {
  const windowInfo = Taro.getWindowInfo()
  const { screenWidth, screenHeight } = windowInfo
  position.value = {
    x: screenWidth - 166,
    y: screenHeight - 140,
  }
})
</script>
