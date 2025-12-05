<template>
  <movable-area
    v-if="state.visible && !state.forceHide"
    :class="styles.movable_area"
    id="global-audio-wrapper"
  >
    <movable-view
      direction="all"
      :class="styles.movable_view"
      :x="state.position.x"
      :y="state.position.y"
      :outOfBounds="false"
      :inertia="false"
      @change="handleChange"
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
        <image
          :src="images.audioClose"
          :class="styles.audioClose"
          @tap="close"
        />
      </view>
    </movable-view>
  </movable-area>
</template>

<script setup lang="ts">
import { MovableArea, MovableView } from '@tarojs/components'
import styles from './index.module.less'
import images from '~/assets/icon-image/images'
import { onMounted } from 'vue'
import Taro from '@tarojs/taro'
import { useAudioStore } from '~/stores/useAudioStore'
import { useAudioFloatStore } from '~/stores/useAudioFloatStore'
import { debounce } from 'es-toolkit'

const { playlistState, playbackState, metadata, togglePlayPause } =
  useAudioStore()
const { state, initPosition, updatePosition, close } = useAudioFloatStore()

const handleToPlay = () => {
  Taro.navigateTo({
    url: `/pages/package-courses/audio-player/index?id=${playlistState.currentPlayingId}`,
  })
}

/** 防抖更新位置（200ms） */
const savePosDebounce = debounce((x: number, y: number) => {
  updatePosition({ x, y })
}, 200)

/** movable-view 拖动监听 */
const handleChange = (e) => {
  const { x, y, source } = e.detail

  // 只在用户拖动情况下保存位置
  if (source === 'touch') {
    savePosDebounce(x, y)
  }
}

onMounted(() => {
  initPosition()
})
</script>
