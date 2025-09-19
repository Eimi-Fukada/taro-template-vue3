import { reactive, ref } from 'vue'
import Taro from '@tarojs/taro'
import { debounce } from 'es-toolkit'
import type {
  FetchDataFunction,
  PaginationState,
  UsePaginationListReturn,
  ErrorType,
  ItemId,
  SearchConfig,
  SortConfig,
} from './types'

/**
 * 分页列表 Hook
 */
export function usePaginationList<T = unknown>(
  fetchData: FetchDataFunction<T>,
  options: {
    readonly pageSize?: number
    readonly debounceDelay?: number
  } = {}
): UsePaginationListReturn<T> {
  const { pageSize = 10, debounceDelay = 300 } = options

  // 分页状态
  const state = reactive<PaginationState<T>>({
    list: [],
    loading: false,
    refreshing: false,
    loadingMore: false,
    hasMore: true,
    error: null,
    isEmpty: false,
    currentPage: 0,
  })

  // 请求锁，防止重复请求
  const requestLock = ref(false)

  /**
   * 处理错误
   */
  const handleError = (error: unknown, type: ErrorType): string => {
    console.error(`[PaginationList] ${type}:`, error)

    if (error instanceof Error) {
      return error.message
    }

    switch (type) {
      case 'NETWORK_ERROR':
        return '网络连接失败，请检查网络设置'
      case 'FETCH_ERROR':
        return '数据加载失败，请稍后重试'
      default:
        return '未知错误，请稍后重试'
    }
  }

  /**
   * 显示错误提示
   */
  const showErrorToast = (message: string): void => {
    Taro.showToast({
      title: message,
      icon: 'none',
      duration: 2000,
    })
  }

  /**
   * 加载数据
   */
  const loadData = async (page: number): Promise<void> => {
    if (requestLock.value) return

    try {
      requestLock.value = true

      // 设置加载状态
      if (page === 1) {
        state.loading = true
        state.error = null
      } else {
        state.loadingMore = true
      }

      const response = await fetchData(page, pageSize)

      // 更新数据
      if (page === 1) {
        state.list = [...response.list]
      } else {
        state.list = [...state.list, ...response.list] as T[]
      }

      state.hasMore = response.hasMore
      state.currentPage = page
      state.isEmpty = state.list.length === 0
      state.error = null
    } catch (error) {
      const errorMessage = handleError(error, 'FETCH_ERROR')
      state.error = errorMessage
      showErrorToast(errorMessage)
    } finally {
      // 重置加载状态
      state.loading = false
      state.loadingMore = false
      requestLock.value = false
    }
  }

  /**
   * 刷新数据
   */
  const refresh = async (): Promise<void> => {
    await loadData(1)
  }

  /**
   * 加载更多数据
   */
  const loadMore = async (): Promise<void> => {
    if (!state.hasMore || state.loadingMore || state.loading) return
    await loadData(state.currentPage + 1)
  }

  /**
   * 重试加载
   */
  const retry = async (): Promise<void> => {
    if (state.currentPage === 0) {
      await loadData(1)
    } else {
      await loadMore()
    }
  }

  /**
   * 重置状态
   */
  const reset = (): void => {
    state.list = []
    state.loading = false
    state.loadingMore = false
    state.hasMore = true
    state.error = null
    state.isEmpty = false
    state.currentPage = 0
  }

  // 防抖处理的加载更多
  const debouncedLoadMore = debounce(loadMore, debounceDelay)

  /**
   * 获取数据项的ID
   */
  const getItemId = (item: T): ItemId => {
    if (typeof item === 'object' && item !== null) {
      // 尝试常见的ID字段
      const idFields = ['id', '_id', 'key', 'uuid']
      for (const field of idFields) {
        if (field in item && (item as any)[field] != null) {
          return (item as any)[field]
        }
      }
    }
    // 如果没有找到ID字段，使用数组索引
    return state.list.findIndex((listItem) => listItem === item)
  }

  /**
   * 根据ID查找数据项
   */
  const findItemById = (id: ItemId): T | undefined => {
    return state.list.find((item) => getItemId(item as T) === id)
  }

  /**
   * 查找数据项
   */
  const findItem = (predicate: (item: T) => boolean): T | undefined => {
    return state.list.find(predicate)
  }

  /**
   * 删除单个数据项
   */
  const removeItem = (id: ItemId): void => {
    try {
      const originalLength = state.list.length
      state.list = state.list.filter((item) => getItemId(item) !== id) as T[]

      // 检查是否删除成功
      if (state.list.length === originalLength) {
        showErrorToast('未找到要删除的数据')
        return
      }

      // 更新空状态
      state.isEmpty = state.list.length === 0

      // 如果当前页数据不足且还有更多数据，可能需要加载更多
      if (state.list.length < pageSize && state.hasMore && !state.loading) {
        loadMore()
      }
    } catch (error) {
      showErrorToast('删除数据失败')
      console.error('[PaginationList] removeItem error:', error)
    }
  }

  /**
   * 批量删除数据项
   */
  const removeItems = (ids: readonly ItemId[]): void => {
    try {
      const idsSet = new Set(ids)
      const originalLength = state.list.length
      state.list = state.list.filter(
        (item) => !idsSet.has(getItemId(item))
      ) as T[]

      // 检查是否有数据被删除
      if (state.list.length === originalLength) {
        showErrorToast('未找到要删除的数据')
        return
      }

      state.isEmpty = state.list.length === 0

      // 如果删除了很多数据，可能需要加载更多
      if (state.list.length < pageSize && state.hasMore && !state.loading) {
        loadMore()
      }
    } catch (error) {
      showErrorToast('批量删除数据失败')
      console.error('[PaginationList] removeItems error:', error)
    }
  }

  /**
   * 更新单个数据项
   */
  const updateItem = (id: ItemId, updates: Partial<T>): void => {
    try {
      const index = state.list.findIndex((item) => getItemId(item as T) === id)
      if (index === -1) {
        showErrorToast('未找到要更新的数据')
        return
      }

      // 更新数据项
      state.list[index] = { ...state.list[index], ...updates } as T
      // 触发响应式更新
      state.list = [...state.list] as T[]
    } catch (error) {
      showErrorToast('更新数据失败')
      console.error('[PaginationList] updateItem error:', error)
    }
  }

  /**
   * 批量更新数据项
   */
  const updateItems = (
    updates: Array<{ readonly id: ItemId; readonly data: Partial<T> }>
  ): void => {
    try {
      const updateMap = new Map(updates.map((u) => [u.id, u.data]))
      let updatedCount = 0

      state.list = state.list.map((item) => {
        const id = getItemId(item)
        const updateData = updateMap.get(id)
        if (updateData) {
          updatedCount++
          return { ...item, ...updateData } as T
        }
        return item
      }) as T[]

      if (updatedCount === 0) {
        showErrorToast('未找到要更新的数据')
      }
    } catch (error) {
      showErrorToast('批量更新数据失败')
      console.error('[PaginationList] updateItems error:', error)
    }
  }

  /**
   * 替换单个数据项
   */
  const replaceItem = (id: ItemId, item: T): void => {
    try {
      const index = state.list.findIndex(
        (existingItem) => getItemId(existingItem as T) === id
      )
      if (index === -1) {
        showErrorToast('未找到要替换的数据')
        return
      }

      state.list[index] = item
      state.list = [...state.list] as T[]
    } catch (error) {
      showErrorToast('替换数据失败')
      console.error('[PaginationList] replaceItem error:', error)
    }
  }

  /**
   * 搜索数据项
   */
  const searchItems = (config: SearchConfig): readonly T[] => {
    const { keyword, fields, caseSensitive = false } = config

    if (!keyword.trim()) {
      return [...state.list]
    }

    const searchKeyword = caseSensitive ? keyword : keyword.toLowerCase()

    return state.list.filter((item) => {
      if (typeof item !== 'object' || item === null) {
        return String(item).includes(searchKeyword)
      }

      const searchFields = fields || Object.keys(item as object)

      return searchFields.some((field) => {
        const value = (item as any)[field]
        if (value == null) return false

        const stringValue = caseSensitive
          ? String(value)
          : String(value).toLowerCase()
        return stringValue.includes(searchKeyword)
      })
    })
  }

  /**
   * 筛选数据项
   */
  const filterItems = (predicate: (item: T) => boolean): readonly T[] => {
    return state.list.filter(predicate)
  }

  /**
   * 排序数据项
   */
  const sortItems = (config: SortConfig<T>): void => {
    const { field, order } = config

    try {
      state.list = [...state.list].sort((a, b) => {
        const aValue = (a as any)[field]
        const bValue = (b as any)[field]

        // 处理 null/undefined 值
        if (aValue == null && bValue == null) return 0
        if (aValue == null) return order === 'asc' ? -1 : 1
        if (bValue == null) return order === 'asc' ? 1 : -1

        // 数字比较
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return order === 'asc' ? aValue - bValue : bValue - aValue
        }

        // 字符串比较
        const aStr = String(aValue)
        const bStr = String(bValue)
        const comparison = aStr.localeCompare(bStr)

        return order === 'asc' ? comparison : -comparison
      }) as T[]
    } catch (error) {
      console.error('[PaginationList] sortItems error:', error)
      showErrorToast('排序失败')
    }
  }

  /**
   * 清空列表
   */
  const clearList = (): void => {
    state.list = []
    state.isEmpty = true
    state.currentPage = 0
    state.hasMore = true
    state.error = null
  }

  /**
   * 获取列表统计信息
   */
  const getStats = () => ({
    total: state.list.length,
    currentPage: state.currentPage,
    hasMore: state.hasMore,
    isEmpty: state.isEmpty,
  })

  return {
    state: state as Readonly<PaginationState<T>>,

    // 基础分页操作
    refresh,
    loadMore: () => {
      debouncedLoadMore()
      return Promise.resolve()
    },
    retry,
    reset,

    // CRUD 操作
    removeItem,
    removeItems,
    updateItem,
    updateItems,
    replaceItem,

    // 查询操作
    searchItems,
    filterItems,
    sortItems,
    findItem,
    findItemById,

    // 工具方法
    getItemId,
    clearList,
    getStats,
  }
}
