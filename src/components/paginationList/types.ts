/**
 * 分页响应数据结构
 */
export interface PaginationResponse<T = any> {
  /** 当前页数据列表 */
  readonly list: readonly T[]
  /** 数据总数 */
  readonly total: number
  /** 是否还有更多数据 */
  readonly hasMore: boolean
}

/**
 * 分页请求函数类型
 */
export type FetchDataFunction<T = any> = (
  page: number,
  pageSize: number
) => Promise<PaginationResponse<T>>

/**
 * 分页组件 Props
 */
export interface PaginationListProps<T = any> {
  /** 数据获取函数 */
  readonly fetchData: FetchDataFunction<T>
  /** 每页数据量，默认 20 */
  readonly pageSize?: number
  /** 触发加载更多的距离，默认 50px */
  readonly lowerThreshold?: number
  /** 空状态文案 */
  readonly emptyText?: string
  /** 没有更多数据文案 */
  readonly noMoreText?: string
  /** 是否启用下拉刷新 */
  readonly enableRefresh?: boolean
  /** 防抖延迟时间，默认 300ms */
  readonly debounceDelay?: number
  /** 高度，如果不传会导致scroll-view无法触发触底事件，如果组件内部托管会增加复杂度，需要开发者自己传递 */
  readonly height: number | string
  /** 自定义空状态图片 */
  readonly emptyImage?: string
  /** 是否自动请求 */
  readonly autoFetch?: boolean
}

/**
 * 分页状态
 */
export interface PaginationState<T = any> {
  /** 数据列表 */
  list: T[] | any[]
  /** 首次加载状态 */
  loading: boolean
  /** 下拉刷新状态 */
  refreshing: boolean
  /** 加载更多状态 */
  loadingMore: boolean
  /** 是否还有更多数据 */
  hasMore: boolean
  /** 错误信息 */
  error: string | null
  /** 是否为空状态 */
  isEmpty: boolean
  /** 当前页码 */
  currentPage: number
}

/**
 * usePaginationList Hook 返回值
 */
export interface UsePaginationListReturn<T = any> {
  /** 分页状态 */
  readonly state: Readonly<PaginationState<T>>
  /** 刷新数据 */
  readonly refresh: () => Promise<void>
  /** 加载更多数据 */
  readonly loadMore: () => Promise<void>
  /** 重试加载 */
  readonly retry: () => Promise<void>
  /** 重置状态 */
  readonly reset: () => void
}

/**
 * 错误类型枚举
 */
export const enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  FETCH_ERROR = 'FETCH_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
