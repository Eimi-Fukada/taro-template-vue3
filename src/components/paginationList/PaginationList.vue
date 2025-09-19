<template>
  <view :class="styles.container">
    <!-- 自定义下拉刷新区域 -->
    <view
      v-if="enableRefresh && pullRefreshVisible"
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
      <!-- 骨架屏 - 首次加载 -->
      <view v-if="state.loading" :class="styles.skeleton">
        <slot name="skeleton">
          <nut-skeleton
            width="100%"
            height="15px"
            animated
            round
            :row="5"
            style="width: 100%"
          />
        </slot>
      </view>

      <!-- 数据列表 -->
      <view v-else-if="!state.isEmpty" :class="styles.list">
        <view
          v-for="(item, index) in state.list"
          :key="getItemKey(item, index)"
          :class="styles.listItem"
        >
          <slot name="item" :item="item" :index="index">
            <view :class="styles.defaultItem">
              {{ JSON.stringify(item) }}
            </view>
          </slot>
        </view>

        <!-- 加载更多状态 -->
        <view v-if="state.loadingMore" :class="styles.loadMore">
          <view :class="styles.loading">
            <view :class="styles.spinner" />
            <text :class="styles.loadingText">正在加载更多...</text>
          </view>
        </view>

        <!-- 没有更多数据 -->
        <view
          v-if="!state.hasMore && !state.loadingMore && state.list.length > 0"
          :class="styles.noMore"
        >
          <text :class="styles.noMoreText">{{ noMoreText }}</text>
        </view>
      </view>

      <!-- 空状态 -->

      <view v-else :class="styles.empty">
        <slot name="empty">
          <image
            :src="emptyImage || images.empty"
            :class="styles.empty_image"
            mode="aspectFit"
          />
          <text :class="styles.emptyText">{{ emptyText }}</text>
        </slot>
      </view>

      <!-- 错误状态 -->
      <view v-if="state.error && !state.loading" :class="styles.error">
        <slot name="error" :error="state.error" :retry="retry">
          <view :class="styles.errorContent">
            <text :class="styles.errorText">{{ state.error }}</text>
            <view :class="styles.retryText" @tap="retry">重试</view>
          </view>
        </slot>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts" generic="T = unknown">
import { ref, onMounted, computed } from 'vue'
import { usePaginationList } from './hooks'
import styles from './index.module.less'
import type { PaginationListProps } from './types'
import images from '~/assets/icon-image/images'

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

// 获取列表项的 key
const getItemKey = (item: T, index: number): string | number => {
  if (typeof item === 'object' && item !== null && 'id' in item) {
    return (item as { id: string | number }).id
  }
  return index
}

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
