/**
 * 导航栏组件属性接口
 */
export interface NavigationProps {
  /**
   * 导航栏标题
   */
  title?: string
  /**
   * 是否显示返回按钮
   * @default true
   */
  backVisible?: boolean
  /**
   * 是否占位
   * @default true
   */
  place?: boolean
  /**
   * 背景透明度
   * @default 1
   */
  bgOpacity?: number
  /**
   * 背景颜色
   * @default #fff
   */
  bgColor?: string
}
