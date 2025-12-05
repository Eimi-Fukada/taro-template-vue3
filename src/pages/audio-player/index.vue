<template>
  <viewContainer>
    <Navigation :title="state.chapterDetail.courseName || ''" :bg-opacity="0" />
    <image :src="Bg" class="absolute top-0 w-screen h-screen -z-10" />
    <view class="flex flex-col items-center justify-center pt-5 px-4">
      <!-- 播放器 -->
      <AudioVoc />

      <RichText
        v-if="state.chapterDetail.manuscript"
        class="mt-5 text-text-secondary text-base"
        :nodes="state.chapterDetail.manuscript"
      ></RichText>
    </view>
  </viewContainer>
</template>

<script setup lang="ts">
import viewContainer from '~/layout/viewContainer.vue'
import { Navigation } from '~/components'
import { useViewModel } from './viewModel.ts'
import { RichText } from '@tarojs/components'
import { imageOssUrl } from '~/config'
import { AudioVoc } from '~/components'

const Bg = `${imageOssUrl}/2025/11/27/e083861210a14ad781fe419014ae0a32.png`

const { state } = useViewModel()
</script>
