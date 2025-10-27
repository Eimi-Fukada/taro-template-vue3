<template>
  <viewContainer>
    <Navigation title="eventChannel通信示例" />
    <view>
      <Button type="primary" @tap="handleBack">Back</Button>
    </view>
  </viewContainer>
</template>

<script setup lang="ts">
import viewContainer from '~/layout/viewContainer.vue'
import Navigation from '~/components/navigation'
import { useViewModel } from './viewModel.ts'
import { Button } from '@tarojs/components'

const { handleBack } = useViewModel()
</script>
