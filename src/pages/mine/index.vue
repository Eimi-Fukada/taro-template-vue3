<template>
  <viewContainer>
    <Navigation title="我的" />
    <view :class="styles.page">
      <Button type="primary" @tap="handleNavigateToMiniProgram">
        跳转小程序
      </Button>
    </view>
  </viewContainer>
</template>

<script setup lang="ts">
import viewContainer from '~/layout/viewContainer.vue'
import Navigation from '~/components/navigation'
import { useViewModel } from './viewModel.ts'
import styles from './index.module.less'
import { Button } from '@tarojs/components'

const { state, handleNavigateToMiniProgram } = useViewModel()
</script>
