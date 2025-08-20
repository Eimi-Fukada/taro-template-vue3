// 定义图片项的接口
export interface ImageItem {
  readonly path: string
  readonly size?: number
  readonly type?: string
  readonly originalFileObj?: File
  readonly [key: string]: unknown // 允许其他可能的属性
}

export interface ChooseImageProps {
  // 最大选择数量
  count?: number
}

export type ChooseImageEmits = {
  // 预览图片时触发
  'on-preview': [url: string]
  // 删除图片时触发
  'on-delete': [item: ImageItem]
  // 选择图片时触发
  'on-choose': [imageList: readonly ImageItem[]]
}
