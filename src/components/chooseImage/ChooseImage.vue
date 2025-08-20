<template>
  <view>
    <!-- 没有图片时显示添加按钮 -->
    <image
      v-if="imageList.length === 0"
      :src="images.addImage"
      :class="styles.default"
      @tap="handleChoose"
    />

    <!-- 有图片时显示图片列表 -->
    <view v-if="imageList.length > 0" :class="styles.page">
      <view
        v-for="item in imageList"
        :key="item.path"
        :class="styles.image_item"
      >
        <image
          :class="styles.item"
          :src="item.path"
          mode="aspectFill"
          @tap="handlePreview(item.path)"
        />
        <image
          :class="styles.del"
          :src="images.delImage"
          @tap="handleDel(item)"
        />
      </view>

      <!-- 未达到最大数量时显示添加按钮 -->
      <image
        v-if="imageList.length !== count"
        :src="images.addImage"
        :class="styles.item"
        @tap="handleChoose"
      />
    </view>

    <!-- 预览遮罩 -->
    <Mask
      :open="state.previewOpen"
      :mask-closable="true"
      @on-close="handleClosePreview"
    >
      <image :src="state.previewImage" @tap="handleClosePreview" />
    </Mask>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import Taro from '@tarojs/taro'
import styles from './index.module.less'
import images from '~/assets/icon-image/images'
import { useSuperLock } from '~/hooks/useSuperLock'
import { Mask } from '~/components'
import type { ChooseImageProps, ImageItem, ChooseImageEmits } from './types'

const imageList = defineModel<ImageItem[]>('imageList', {
  default: () => [],
  required: true,
})

const { count = 1 } = defineProps<ChooseImageProps>()

// Emits 定义
const emits = defineEmits<ChooseImageEmits>()

// 预览相关状态
const state = reactive({
  previewOpen: false,
  previewImage: '',
})

// 处理预览
const handlePreview = (url: string): void => {
  state.previewImage = url
  state.previewOpen = true
  emits('on-preview', url)
}

// 关闭预览
const handleClosePreview = () => {
  state.previewOpen = false
}

// 处理选择图片
const [handleChoose] = useSuperLock(async () => {
  Taro.chooseImage({
    count: count,
    sizeType: ['original', 'compressed'],
    sourceType: ['environment'],
    success: async function (res: Taro.chooseImage.SuccessCallbackResult) {
      // 确保 tempFiles 存在且有元素
      if (res.tempFiles && res.tempFiles.length > 0) {
        const newImageList = [
          ...imageList.value,
          res.tempFiles[0] as unknown as ImageItem,
        ]
        imageList.value = newImageList
        emits('on-choose', newImageList)
      }
    },
  })
})

// 处理删除图片
const handleDel = (item: ImageItem): void => {
  imageList.value = imageList.value.filter((i) => i.path !== item.path)
  emits('on-delete', item)
}
</script>
