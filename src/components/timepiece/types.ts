/**
 * 计时器组件属性接口
 */
export interface TimepieceProps {
  /**
   * 是否显示
   * @default false
   */
  open?: boolean
}

/**
 * 计时器组件事件接口
 */
export interface TimepieceEmits {
  /**
   * 关闭事件
   */
  'on-close': []
}
