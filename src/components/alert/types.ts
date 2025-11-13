export interface AlertProps {
  // 标题
  title?: string

  // 内容
  content: string

  // 取消按钮文本
  cancelText?: string

  // 确认按钮文本
  confirmText?: string
}

export type AlertEmits = {
  // 点击取消文案时触发
  'on-cancel': []
  // 点击遮罩层时触发
  'on-confirm': []
}
