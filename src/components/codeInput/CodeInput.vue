<template>
  <view :class="styles.page">
    <input
      v-model="value"
      type="number"
      placeholder="请输入验证码"
      maxLength="4"
      :class="styles.input"
      :adjustPosition="false"
    />

    <!-- 获取验证码按钮 -->
    <view
      v-show="!isCountingDown"
      :class="styles.getCode"
      @tap="handleSendCode"
    >
      获取验证码
    </view>

    <!-- 倒计时显示 -->
    <view v-show="isCountingDown" :class="styles.disabled">
      <CountDown
        ref="countDownRef"
        :time="countdownTime"
        :auto-start="false"
        format="ss"
        @on-finish="handleCountdownFinish"
      >
        <template #default="{ timeData }">
          重新获取({{ timeData.totalSeconds }}s)
        </template>
      </CountDown>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Taro from '@tarojs/taro'
import styles from './index.module.less'
import { CountDown } from '~/components'
import type { CodeInputProps, CodeInputEmits } from './types'

// 使用 defineModel 管理验证码值
const value = defineModel<string>('value', { default: '' })

const { phone, countdownTime = 60 } = defineProps<CodeInputProps>()

// Emits 定义
const emits = defineEmits<CodeInputEmits>()

// 倒计时状态
const isCountingDown = ref(false)
const countDownRef = ref()

// 发送验证码
const handleSendCode = async () => {
  if (phone.trim().length === 0 || phone.trim().length !== 11) {
    Taro.showToast({
      title: '请输入正确的手机号',
      icon: 'none',
    })
    return
  }

  // 开始倒计时
  isCountingDown.value = true
  countDownRef.value?.restart()

  // 触发发送验证码事件
  emits('on-send-code')
}

// 倒计时结束
const handleCountdownFinish = () => {
  isCountingDown.value = false
  emits('on-countdown-finish')
}
</script>
