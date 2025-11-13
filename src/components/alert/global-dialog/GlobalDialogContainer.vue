<template>
  <AlertDialog
    v-if="dialogState"
    v-model:open="dialogState.visible"
    :content="dialogState.content"
    :cancel-text="dialogState.cancelText"
    :confirm-text="dialogState.confirmText"
    @on-confirm="handleConfirm"
    @on-cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import { inject } from 'vue'
import AlertDialog from '~/components/alert'
import type { GlobalDialogManager } from '~/components/alert/global-dialog/globalDialog'

// 注入全局弹窗管理器
const dialogManager = inject<GlobalDialogManager>('$dialog')

if (!dialogManager) {
  console.error(
    'GlobalDialogManager not found. Make sure GlobalDialogPlugin is installed.'
  )
}

// 获取弹窗状态
const dialogState = dialogManager?.getState()

// 处理确认事件
const handleConfirm = () => {
  if (dialogState?.onConfirm) {
    dialogState.onConfirm()
  }
}

// 处理取消事件
const handleCancel = () => {
  if (dialogState?.onCancel) {
    dialogState.onCancel()
  }
}
</script>
