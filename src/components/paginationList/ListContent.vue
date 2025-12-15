<template>
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
</template>

<script setup lang="ts" generic="T = unknown">
import styles from './index.module.less'
import images from '~/assets/icon-image/images'

// Props 定义
defineProps<{
  state: {
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
  emptyText?: string
  emptyImage?: string
  noMoreText?: string
  retry: () => void
}>()

// 获取列表项的 key
const getItemKey = (item: T, index: number): string | number => {
  if (typeof item === 'object' && item !== null && 'id' in item) {
    return (item as { id: string | number }).id
  }
  return index
}
</script>
