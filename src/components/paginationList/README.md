# PaginationList 分页列表组件

一个基于 Taro + Vue 3 的高性能分页列表组件，支持下拉刷新、上拉加载更多、骨架屏、错误处理等功能。

## 特性

- 🚀 **高性能**: 内置防抖机制，避免重复请求
- 🔄 **下拉刷新**: 支持自定义下拉刷新样式
- 📱 **上拉加载**: 自动触发加载更多数据
- 💀 **骨架屏**: 优雅的加载状态展示
- ❌ **错误处理**: 完善的错误重试机制
- 🎨 **高度自定义**: 支持自定义各种状态的展示
- 📦 **TypeScript**: 完整的类型定义
- 🌐 **跨平台**: 支持微信小程序、H5、支付宝小程序等

## 安装使用

```typescript
import { PaginationList } from '@/components/paginationList'
import type { FetchDataFunction, PaginationResponse } from '@/components/paginationList'
```

## 基础用法

```vue
<template>
  <pagination-list
    :fetch-data="fetchData"
    :page-size="10"
    :height="500"
  >
    <template #item="{ item, index }">
      <view class="list-item">
        <text>{{ item.title }}</text>
      </view>
    </template>
  </pagination-list>
</template>

<script setup lang="ts">
import type { FetchDataFunction, PaginationResponse } from '@/components/paginationList'

interface ListItem {
  id: number
  title: string
  content: string
}

const fetchData: FetchDataFunction<ListItem> = async (page, pageSize) => {
  const response = await api.getList({ page, pageSize })
  
  return {
    list: response.data,
    total: response.total,
    hasMore: page * pageSize < response.total
  }
}
</script>
```

## API

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| fetchData | `FetchDataFunction<T>` | - | **必需**，数据获取函数 |
| pageSize | `number` | `20` | 每页数据量 |
| lowerThreshold | `number` | `80` | 触发加载更多的距离（px） |
| emptyText | `string` | `'暂无数据'` | 空状态文案 |
| noMoreText | `string` | `'没有更多数据了'` | 没有更多数据文案 |
| enableRefresh | `boolean` | `true` | 是否启用下拉刷新 |
| debounceDelay | `number` | `300` | 防抖延迟时间（ms） |

### FetchDataFunction

数据获取函数的类型定义：

```typescript
type FetchDataFunction<T> = (
  page: number,
  pageSize: number
) => Promise<PaginationResponse<T>>

interface PaginationResponse<T> {
  /** 当前页数据列表 */
  list: readonly T[]
  /** 数据总数 */
  total: number
  /** 是否还有更多数据 */
  hasMore: boolean
}
```

### 插槽

| 插槽名 | 参数 | 说明 |
|--------|------|------|
| item | `{ item: T, index: number }` | 自定义列表项 |
| skeleton | - | 自定义骨架屏 |
| empty | - | 自定义空状态 |
| error | `{ error: string, retry: () => void }` | 自定义错误状态 |

### 组件实例方法

通过 `ref` 可以访问以下方法：

```typescript
interface PaginationListInstance {
  refresh: () => Promise<void>     // 刷新数据
  loadMore: () => Promise<void>    // 加载更多
  retry: () => Promise<void>       // 重试
  reset: () => void               // 重置状态
  state: PaginationState<T>       // 当前状态
}
```

## 高级用法

### 自定义样式

```vue
<template>
  <pagination-list :fetch-data="fetchData" :page-size="10">
    <!-- 自定义列表项 -->
    <template #item="{ item, index }">
      <view class="custom-item">
        <image :src="item.avatar" class="avatar" />
        <view class="content">
          <text class="title">{{ item.title }}</text>
          <text class="desc">{{ item.description }}</text>
        </view>
      </view>
    </template>

    <!-- 自定义骨架屏 -->
    <template #skeleton>
      <view class="skeleton-container">
        <view v-for="i in 5" :key="i" class="skeleton-item">
          <view class="skeleton-avatar"></view>
          <view class="skeleton-content">
            <view class="skeleton-title"></view>
            <view class="skeleton-desc"></view>
          </view>
        </view>
      </view>
    </template>

    <!-- 自定义空状态 -->
    <template #empty>
      <view class="empty-container">
        <image src="/images/empty.png" class="empty-image" />
        <text class="empty-text">暂无内容</text>
        <button class="empty-button" @tap="handleRefresh">刷新试试</button>
      </view>
    </template>

    <!-- 自定义错误状态 -->
    <template #error="{ error, retry }">
      <view class="error-container">
        <text class="error-text">{{ error }}</text>
        <button class="retry-button" @tap="retry">重新加载</button>
      </view>
    </template>
  </pagination-list>
</template>
```

### 使用组件实例方法

```vue
<template>
  <view>
    <pagination-list ref="listRef" :fetch-data="fetchData">
      <!-- 内容 -->
    </pagination-list>
    
    <view class="actions">
      <button @tap="handleRefresh">刷新</button>
      <button @tap="handleLoadMore">加载更多</button>
      <button @tap="handleReset">重置</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const listRef = ref()

const handleRefresh = () => {
  listRef.value?.refresh()
}

const handleLoadMore = () => {
  listRef.value?.loadMore()
}

const handleReset = () => {
  listRef.value?.reset()
}
</script>
```

## 注意事项

1. **滚动触发**: 由于使用了 `scroll-view`，在某些情况下可能需要设置容器高度才能正确触发 `scrolltolower` 事件
2. **数据格式**: `fetchData` 函数必须返回符合 `PaginationResponse` 接口的数据
3. **错误处理**: 组件会自动捕获 `fetchData` 中的错误并显示错误状态
4. **防抖机制**: 内置防抖，避免快速滚动时的重复请求
5. **跨平台兼容**: 在不同平台上滚动行为可能略有差异

## 常见问题

### Q: 为什么无法触发加载更多？
A: 请检查 `scroll-view` 是否有足够的高度，必要时可以为容器设置固定高度。

### Q: 如何自定义加载状态？
A: 可以通过 `skeleton` 插槽自定义骨架屏，通过监听组件状态来显示自定义加载提示。

### Q: 如何处理网络错误？
A: 组件会自动捕获 `fetchData` 中抛出的错误，可以通过 `error` 插槽自定义错误展示。

### Q: 如何实现搜索功能？
A: 可以在 `fetchData` 函数中根据搜索条件请求数据，然后调用组件的 `refresh()` 方法重新加载。

