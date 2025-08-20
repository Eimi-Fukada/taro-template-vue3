/**
 * 遮罩层组件属性接口
 */
export interface MaskProps {
  /**
   * 是否显示
   * @default false
   */
  open?: boolean

  /**
   * 是否开启蒙层
   * @default true
   */
  mask?: boolean

  /**
   * 点击蒙层是否关闭
   * @default false
   */
  maskClosable?: boolean

  /**
   * 内容出现的位置
   * @default 'center'
   */
  position?: 'bottom' | 'center'
}
