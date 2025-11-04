<template>
  <viewContainer>
    <Navigation title="首页" :bg-opacity="state.scrollOpacity" />
    <view :class="styles.page">
      <view class="text-[#000] text-[24px]">
        {{ state.count }}
      </view>
      <!-- filter: drop-shadow(offset-x offset-y blur-radius color)可以用来给图片添加阴影 -->
      <image
        :src="images.error"
        class="w-full"
        mode="widthFix"
        style="filter: drop-shadow(10px 2px 10px rgba(0, 0, 0, 0.8))"
      />
      <Button type="primary" @tap="increment">click</Button>
      <Button type="primary" @tap="handleEventChannel">事件通信</Button>
    </view>
  </viewContainer>
</template>

<script setup lang="ts">
import viewContainer from '~/layout/viewContainer.vue'
import Navigation from '~/components/navigation'
import styles from './index.module.less'
import { useViewModel } from './viewModel.ts'
import { Button } from '@tarojs/components'
import images from '~/assets/icon-image/images.ts'

const { state, increment, handleEventChannel } = useViewModel()
</script>
