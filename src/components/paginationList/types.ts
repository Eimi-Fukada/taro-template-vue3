/**
 * 【滚动策略模式】
 */
export type ScrollMode = 'container' | 'page'

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

export interface BaseProps<T = any> {
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
  /** 自定义空状态图片 */
  readonly emptyImage?: string
  /** 是否自动请求 */
  readonly autoFetch?: boolean
}

/** container 模式必须传 height */
export interface ContainerModeProps<T = any> extends BaseProps<T> {
  /**
   * 滚动模式，默认为 'container'，可选 'page' 模式
   */
  scrollMode?: 'container'
  /** 高度，如果不传会导致scroll-view无法触发触底事件，如果组件内部托管会增加复杂度，需要开发者自己传递 */
  height: number | string
}

/** page 模式 height 可选 */
export interface PageModeProps<T = any> extends BaseProps<T> {
  /**
   * 滚动模式，默认为 'container'，可选 'page' 模式
   */
  scrollMode: 'page'
  /** height 可选 */
  height?: number | string
}

/**
 * 分页组件 Props
 */
export type PaginationListProps<T = any> =
  | ContainerModeProps<T>
  | PageModeProps<T>

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
 * 数据项 ID 类型
 */
export type ItemId = string | number

/**
 * 搜索配置
 */
export interface SearchConfig {
  /** 搜索关键词 */
  readonly keyword: string
  /** 搜索字段，如果不指定则搜索所有字段 */
  readonly fields?: readonly string[]
  /** 是否区分大小写，默认 false */
  readonly caseSensitive?: boolean
}

/**
 * 排序配置
 */
export interface SortConfig<T = any> {
  /** 排序字段 */
  readonly field: keyof T
  /** 排序方向 */
  readonly order: 'asc' | 'desc'
}

/**
 * usePaginationList Hook 返回值
 */
export interface UsePaginationListReturn<T = any> {
  /** 分页状态 */
  readonly state: Readonly<PaginationState<T>>

  // 基础分页操作
  /** 刷新数据 */
  readonly refresh: () => Promise<void>
  /** 加载更多数据 */
  readonly loadMore: () => Promise<void>
  /** 重试加载 */
  readonly retry: () => Promise<void>
  /** 重置状态 */
  readonly reset: () => void

  // CRUD 操作
  /** 删除单个数据项 */
  readonly removeItem: (id: ItemId) => void
  /** 批量删除数据项 */
  readonly removeItems: (ids: readonly ItemId[]) => void
  /** 更新单个数据项 */
  readonly updateItem: (id: ItemId, updates: Partial<T>) => void
  /** 批量更新数据项 */
  readonly updateItems: (
    updates: Array<{ readonly id: ItemId; readonly data: Partial<T> }>
  ) => void
  /** 替换单个数据项 */
  readonly replaceItem: (id: ItemId, item: T) => void

  // 查询操作
  /** 搜索数据项 */
  readonly searchItems: (config: SearchConfig) => readonly T[]
  /** 筛选数据项 */
  readonly filterItems: (predicate: (item: T) => boolean) => readonly T[]
  /** 排序数据项 */
  readonly sortItems: (config: SortConfig<T>) => void
  /** 查找数据项 */
  readonly findItem: (predicate: (item: T) => boolean) => T | undefined
  /** 根据 ID 查找数据项 */
  readonly findItemById: (id: ItemId) => T | undefined

  // 工具方法
  /** 获取数据项的 ID */
  readonly getItemId: (item: T) => ItemId
  /** 清空列表 */
  readonly clearList: () => void
  /** 获取列表统计信息 */
  readonly getStats: () => {
    readonly total: number
    readonly currentPage: number
    readonly hasMore: boolean
    readonly isEmpty: boolean
  }
}

/**
 * 错误类型
 */
export type ErrorType = 'NETWORK_ERROR' | 'FETCH_ERROR' | 'UNKNOWN_ERROR'
