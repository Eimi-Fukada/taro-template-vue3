/**
 * 自定义选择器组件属性接口
 */
export interface CustomPickerProps {
  /**
   * 选择器类型
   * @default 'selector'
   */
  mode?: 'selector' | 'multiSelector' | 'time' | 'date' | 'region'

  /**
   * 日期选择器的粒度
   * @default 'day'
   */
  fields?: 'year' | 'month' | 'day'

  /**
   * 选择器选项范围
   * @default []
   */
  range?: Array<number | string>

  /**
   * 占位文本
   * @default ''
   */
  placeholder?: string

  /**
   * 当前选中的值
   */
  value?: string
}
