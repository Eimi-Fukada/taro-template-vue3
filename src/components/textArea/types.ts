/**
 * 文本域组件属性接口
 */
export interface TextAreaProps {
  /**
   * 占位文本
   * @default '请输入内容'
   */
  placeholder?: string

  /**
   * 最大字符数
   * @default 100
   */
  maxLength?: number

  /**
   * 文本域高度（像素）
   * @default 50
   */
  height?: number

  /**
   * 文本域最小高度（像素）
   * @default 50
   */
  minHeight?: number

  /**
   * 是否自动增高
   * @default false
   */
  autoHeight?: boolean
}
