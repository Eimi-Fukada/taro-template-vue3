<template>
  <picker
    :mode="mode"
    :range="range"
    :fields="fields"
    :value="selectValue"
    start="1920-01-01"
    end="2023-12-31"
    @change="(e) => handleChange(e)"
    @cancel="visible = false"
  >
    <view :class="styles.page" @click="visible = true">
      <view
        :class="styles.placeholder"
        :style="selectValue ? { color: '#000' } : {}"
      >
        {{ selectValue ? selectValue : placeholder }}
      </view>
      <image
        :src="images.down"
        :class="styles.downIcon"
        :style="visible ? { transform: 'rotate(-180deg)' } : {}"
      />
    </view>
  </picker>
</template>

<script setup lang="ts">
import styles from './index.module.less'
import images from '~/assets/icon-image/images'
import { ref } from 'vue'
import type { CustomPickerProps } from './types'

// Props 定义
const {
  mode = 'selector',
  fields = 'day',
  range = [],
  placeholder = '',
} = defineProps<CustomPickerProps>()

// 使用 defineModel 实现双向绑定
const selectValue = defineModel<string>('value', { default: '' })
const visible = ref(false)

// 处理选择变化
const handleChange = (e) => {
  if (mode === 'selector' || mode === 'multiSelector') {
    selectValue.value = range[e.detail.value] as string
  } else {
    selectValue.value = e.detail.value
  }
  visible.value = false
}
</script>
