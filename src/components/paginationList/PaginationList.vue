<template>
  <view :class="styles.container">
    <!-- 自定义下拉刷新区域, 下拉刷新区域（只在 container 模式显示) -->
    <view
      v-if="scrollMode === 'container' && enableRefresh && pullRefreshVisible"
      :class="styles.pullRefresh"
      :style="{ height: pullRefreshHeight + 'px' }"
    >
      <view :class="styles.pullRefreshContent">
        <view :class="styles.spinner" />
        <!-- <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
            class="opacity-25"
          />
          <path
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            class="opacity-75"
          />
        </svg> -->
      </view>
    </view>

    <scroll-view
      v-if="scrollMode === 'container'"
      :class="styles.scrollView"
      :scroll-y="true"
      enhanced
      :lower-threshold="lowerThreshold"
      :style="scrollViewStyle"
      @scroll="handleScroll"
      @scrolltolower="handleScrollToLower"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <ListContent
        :state="state"
        :retry="retry"
        :empty-text="emptyText"
        :empty-image="emptyImage"
        :no-more-text="noMoreText"
      >
        <template #skeleton>
          <slot name="skeleton" />
        </template>

        <template #item="slotProps">
          <slot name="item" v-bind="slotProps" />
        </template>

        <template #empty>
          <slot name="empty" />
        </template>

        <template #error="slotProps">
          <slot name="error" v-bind="slotProps" />
        </template>
      </ListContent>
    </scroll-view>

    <!-- 页面滚动模式 -->
    <view v-else :class="styles.scrollView">
      <ListContent
        :state="state"
        :retry="retry"
        :empty-text="emptyText"
        :empty-image="emptyImage"
        :no-more-text="noMoreText"
      >
        <template #item="slotProps">
          <slot name="item" v-bind="slotProps" />
        </template>
      </ListContent>
    </view>
  </view>
</template>

<script setup lang="ts" generic="T = unknown">
import { ref, onMounted, computed } from 'vue'
import { usePaginationList } from './hooks'
import styles from './index.module.less'
import type { PaginationListProps } from './types'
import ListContent from './ListContent.vue'

// Props 定义
const {
  fetchData,
  pageSize = 10,
  lowerThreshold = 80,
  emptyText = '暂无数据',
  emptyImage,
  noMoreText = '没有更多数据了',
  enableRefresh = true,
  debounceDelay = 300,
  height,
  autoFetch = true,
  scrollMode = 'container',
} = defineProps<PaginationListProps<T>>()

// 使用分页 Hook
const {
  state,
  refresh,
  loadMore,
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
} = usePaginationList<T>(fetchData, {
  pageSize,
  debounceDelay,
})

// 计算 scroll-view 的样式
const scrollViewStyle = computed(() => {
  if (height) {
    return {
      height: typeof height === 'number' ? `${height}px` : height,
    }
  }
  return {}
})

// 下拉刷新相关状态
const pullRefreshVisible = ref(false)
const pullRefreshHeight = ref(0)
// const scrollTop = ref(0)

// 触摸相关状态
const touchStartY = ref(0)
const touchMoveY = ref(0)
const isPulling = ref(false)
const maxPullDistance = 60 // 最大下拉距离

// 处理触摸开始
const handleTouchStart = (event: TouchEvent) => {
  if (!enableRefresh || state.loading) return

  touchStartY.value = event.touches[0].clientY
  isPulling.value = false
}

// 处理触摸移动
const handleTouchMove = (event: TouchEvent) => {
  if (!enableRefresh || state.loading) return

  touchMoveY.value = event.touches[0].clientY
  const deltaY = touchMoveY.value - touchStartY.value

  // 只有在顶部且向下拉时才触发下拉刷新
  if (deltaY > 0) {
    event.preventDefault()
    isPulling.value = true

    // 计算下拉距离
    const pullDistance = Math.min(deltaY * 0.4, maxPullDistance)
    pullRefreshHeight.value = pullDistance

    if (pullDistance > 10) {
      pullRefreshVisible.value = true
    }
  }
}

// 处理触摸结束
const handleTouchEnd = async () => {
  if (!enableRefresh || state.loading || !isPulling.value) return

  if (pullRefreshHeight.value >= 40) {
    // 触发刷新
    pullRefreshHeight.value = 50

    try {
      await refresh()
    } finally {
      // 刷新完成，隐藏下拉区域
      hidePullRefresh()
    }
  } else {
    // 未达到刷新条件，隐藏下拉区域
    hidePullRefresh()
  }

  isPulling.value = false
}

// 隐藏下拉刷新区域
const hidePullRefresh = () => {
  pullRefreshHeight.value = 0
  pullRefreshVisible.value = false
}

// 处理滚动事件
const handleScroll = () => {
  // scrollTop.value = event.detail.scrollTop

  // 如果正在下拉刷新过程中滚动了，取消下拉刷新
  if (isPulling.value) {
    isPulling.value = false
    handleRefresh()
  }
}

// 处理下拉刷新（兼容原有接口）
const handleRefresh = async (): Promise<void> => {
  await refresh()
}

// 处理滚动到底部
const handleScrollToLower = async (): Promise<void> => {
  await loadMore()
}

// 组件挂载时加载首页数据
onMounted(async () => {
  if (autoFetch) {
    await refresh()
  }
})

// 暴露方法给父组件
defineExpose({
  refresh,
  loadMore,
  retry,
  reset,
  state,
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
})
</script>
