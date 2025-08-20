export interface ActionSheetItem {
  readonly id: string | number
  readonly name: string
  readonly disabled?: boolean
  readonly color?: string
}

export interface ActionSheetProps {
  // 操作项列表
  items?: readonly ActionSheetItem[]

  // 标题
  title?: string

  // 取消按钮文本
  cancelText?: string

  // 点击遮罩是否关闭
  maskClosable?: boolean
}

export type ActionSheetEmits = {
  // 选择之后触发
  'on-choose': [item: ActionSheetItem, index: number]
  // 点击取消文案时触发
  'on-cancel': []
  // 点击遮罩层时触发
  'on-close': []
}
