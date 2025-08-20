/**
 * 选项卡项目接口
 */
export interface TabItem {
  /**
   * 显示标签
   */
  label: string

  /**
   * 选项值
   */
  value: number
}

/**
 * 选项卡组件属性接口
 */
export interface TabsProps {
  /**
   * 选项卡数据
   * @default []
   */
  data?: TabItem[]
}

/**
 * 选项卡组件事件接口
 */
export interface TabsEmits {
  /**
   * 选项卡变化事件
   */
  'on-change': [index: number]
}
