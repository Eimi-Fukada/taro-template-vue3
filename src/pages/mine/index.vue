<template>
  <viewContainer>
    <Navigation title="我的" />
    <view :class="styles.page">mine</view>
  </viewContainer>
</template>

<script setup lang="ts">
import viewContainer from '~/layout/viewContainer.vue'
import Navigation from '~/components/navigation'
import { useViewModel } from './viewModel.ts'
import styles from './index.module.less'

const { state } = useViewModel()
</script>
