<template>
  <viewContainer>
    <Navigation title="首页" :bg-opacity="state.scrollOpacity" />
    <view :class="styles.page">
      <view class="text-[#000] text-[24px]">
        {{ state.count }}
      </view>
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

const { state, increment, handleEventChannel } = useViewModel()
</script>
