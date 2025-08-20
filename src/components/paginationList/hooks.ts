import { reactive, ref } from 'vue'
import Taro from '@tarojs/taro'
import { debounce } from 'es-toolkit'
import {
  FetchDataFunction,
  PaginationState,
  UsePaginationListReturn,
  ErrorType,
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
      const errorMessage = handleError(error, ErrorType.FETCH_ERROR)
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

  return {
    state: state as Readonly<PaginationState<T>>,
    refresh,
    loadMore: () => {
      debouncedLoadMore()
      return Promise.resolve()
    },
    retry,
    reset,
  }
}
