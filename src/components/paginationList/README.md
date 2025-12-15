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
- ✨ **CRUD 操作**: 完整的增删改查功能
- 🔍 **搜索排序**: 内置搜索、筛选、排序功能
- 🛠️ **Hook 支持**: 提供 `usePaginationList` Hook 用于逻辑复用

## 安装使用

```typescript
// 组件方式
import { PaginationList } from '@/components/paginationList'
import type { FetchDataFunction, PaginationResponse } from '@/components/paginationList'

// Hook 方式
import { usePaginationList } from '@/components/paginationList/hooks'
import type { 
  UsePaginationListReturn, 
  SearchConfig, 
  SortConfig, 
  CrudOptions 
} from '@/components/paginationList/types'
```

## 基础用法

``vue
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

## Hook 使用方式

除了组件方式，还可以使用 `usePaginationList` Hook 来获得更灵活的控制：

``vue
<template>
  <view class="container">
    <!-- 操作栏 -->
    <view class="toolbar">
      <button @tap="handleAddItem">添加</button>
      <button @tap="handleRefresh">刷新</button>
      <input v-model="searchKeyword" placeholder="搜索..." @input="handleSearch" />
    </view>

    <!-- 列表内容 -->
    <scroll-view 
      scroll-y 
      :style="{ height: '500px' }"
      @scrolltolower="loadMore"
    >
      <view v-if="state.loading" class="loading">加载中...</view>
      
      <view v-for="(item, index) in state.list" :key="getItemId(item)" class="list-item">
        <text>{{ item.title }}</text>
        <view class="actions">
          <button @tap="handleEdit(item)">编辑</button>
          <button @tap="handleDelete(getItemId(item))">删除</button>
        </view>
      </view>
      
      <view v-if="state.isEmpty" class="empty">暂无数据</view>
      <view v-if="state.error" class="error">
        {{ state.error }}
        <button @tap="retry">重试</button>
      </view>
      <view v-if="!state.hasMore && !state.isEmpty" class="no-more">没有更多了</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePaginationList } from '@/components/paginationList/hooks'

interface ListItem {
  id: number
  title: string
  content: string
}

const searchKeyword = ref('')

// 使用 Hook
const {
  state,
  refresh,
  loadMore,
  retry,
  addItem,
  removeItem,
  updateItem,
  searchItems,
  getItemId
} = usePaginationList<ListItem>(fetchData, {
  pageSize: 20,
  debounceDelay: 300
})

// 数据获取函数
async function fetchData(page: number, pageSize: number) {
  const response = await api.getList({ page, pageSize })
  return {
    list: response.data,
    total: response.total,
    hasMore: page * pageSize < response.total
  }
}

// 添加项目
const handleAddItem = () => {
  const newItem: ListItem = {
    id: Date.now(),
    title: `新项目 ${Date.now()}`,
    content: '新内容'
  }
  addItem(newItem)
}

// 编辑项目
const handleEdit = (item: ListItem) => {
  updateItem(item.id, {
    title: item.title + ' (已编辑)',
    content: '更新的内容'
  })
}

// 删除项目
const handleDelete = (id: number) => {
  removeItem(id)
}

// 搜索
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    const results = searchItems({
      keyword: searchKeyword.value,
      fields: ['title', 'content'],
      caseSensitive: false
    })
    console.log('搜索结果:', results)
  }
}

// 刷新数据
const handleRefresh = () => {
  refresh()
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
| scrollMode | `'container' \| 'page'` | `'container'` | 滚动模式，container模式使用组件内部scroll-view，page模式交给页面托管滚动 |

### FetchDataFunction

数据获取函数的类型定义：

``typescript
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

### Hook API

`usePaginationList<T>(fetchData, options)` 返回以下方法和状态：

``typescript
interface UsePaginationListReturn<T> {
  // 状态
  state: Readonly<PaginationState<T>>
  
  // 基础分页操作
  refresh: () => Promise<void>                    // 刷新数据
  loadMore: () => Promise<void>                   // 加载更多
  retry: () => Promise<void>                      // 重试
  reset: () => void                              // 重置状态
  
  // CRUD 操作
  addItem: (item: T, options?: CrudOptions) => void
  addItems: (items: T[], options?: CrudOptions) => void
  removeItem: (id: ItemId, options?: CrudOptions) => void
  removeItems: (ids: ItemId[], options?: CrudOptions) => void
  updateItem: (id: ItemId, updates: Partial<T>, options?: CrudOptions) => void
  updateItems: (updates: Array<{id: ItemId, data: Partial<T>}>, options?: CrudOptions) => void
  replaceItem: (id: ItemId, item: T, options?: CrudOptions) => void
  
  // 查询操作
  searchItems: (config: SearchConfig) => T[]
  filterItems: (predicate: (item: T) => boolean) => T[]
  sortItems: (config: SortConfig<T>) => void
  findItem: (predicate: (item: T) => boolean) => T | undefined
  findItemById: (id: ItemId) => T | undefined
  
  // 工具方法
  getItemId: (item: T) => ItemId
  clearList: () => void
  getStats: () => { total: number, currentPage: number, hasMore: boolean, isEmpty: boolean }
}
```

#### 类型定义

``typescript
// 数据项 ID 类型
type ItemId = string | number

// 搜索配置
interface SearchConfig {
  keyword: string                    // 搜索关键词
  fields?: string[]                  // 搜索字段，不指定则搜索所有字段
  caseSensitive?: boolean           // 是否区分大小写，默认 false
}

// 排序配置
interface SortConfig<T> {
  field: keyof T                    // 排序字段
  order: 'asc' | 'desc'            // 排序方向
}

// CRUD 操作选项
interface CrudOptions {
  showErrorToast?: boolean          // 是否显示错误提示，默认 true
}

// 分页状态
interface PaginationState<T> {
  list: T[]                        // 数据列表
  loading: boolean                 // 首次加载状态
  refreshing: boolean              // 下拉刷新状态
  loadingMore: boolean             // 加载更多状态
  hasMore: boolean                 // 是否还有更多数据
  error: string | null             // 错误信息
  isEmpty: boolean                 // 是否为空状态
  currentPage: number              // 当前页码
}
```

### 组件实例方法

通过 `ref` 可以访问以下方法：

``typescript
interface PaginationListInstance {
  refresh: () => Promise<void>     // 刷新数据
  loadMore: () => Promise<void>    // 加载更多
  retry: () => Promise<void>       // 重试
  reset: () => void               // 重置状态
  state: PaginationState<T>       // 当前状态
}
```

## 高级用法

### 滚动模式 (scrollMode)

PaginationList 支持两种滚动模式：

#### 1. container 模式（默认）

使用组件内部的 scroll-view，支持上下拉、触底事件自动加载更多。

**特点：**
- 必须传递 height，否则 scrolltolower 等事件无法触发
- 适合列表独立滚动，不依赖页面整体滚动
- 组件内部处理所有滚动事件

**示例：**

```vue
<template>
  <pagination-list
    :fetch-data="fetchData"
    :height="500"
    scroll-mode="container"
  >
    <template #item="{ item }">
      <view>{{ item.title }}</view>
    </template>
  </pagination-list>
</template>
```

#### 2. page 模式

列表滚动由页面托管，scroll-view 不再需要内部高度。

**特点：**
- 不必传 height，列表高度会随页面自然增长
- 适合全页面滚动场景，如页面有导航栏、轮播图等
- 滚动事件由页面的 usePageScroll 或小程序的 onPageScroll 处理
- 触底事件由页面的 useReachBottom 或小程序的 onReachBottom 处理

**示例：**

```vue
<template>
  <view>
    <Navigation title="首页" />
    <nut-swiper :auto-play="3000">
      <nut-swiper-item v-for="(s, i) in banners" :key="i">
        <image :src="s" />
      </nut-swiper-item>
    </nut-swiper>

    <pagination-list
      :fetch-data="fetchData"
      scroll-mode="page"
    >
      <template #item="{ item }">
        <view>{{ item.title }}</view>
      </template>
    </pagination-list>
  </view>
</template>
```

#### scrollMode 使用注意事项

- **容器高度**：container 模式必须传 height，page 模式下不需要传 height
- **滚动触发**：scroll-view 必须有高度才能触发 scrolltolower 事件，page 模式下使用页面滚动事件
- **下拉刷新**：内置防抖机制，避免重复请求，开启 enableRefresh 可自定义下拉刷新样式
- **空状态、错误状态、骨架屏**：可以通过插槽自定义显示
- **跨平台**：微信小程序、H5、支付宝小程序等平台滚动行为略有差异，推荐在页面测试
- **CRUD 和搜索**：Hook 提供本地数据操作，page 模式可直接使用页面滚动监听

### CRUD 操作示例

``vue
<template>
  <view class="crud-example">
    <!-- 操作工具栏 -->
    <view class="toolbar">
      <button @tap="handleBatchAdd">批量添加</button>
      <button @tap="handleBatchDelete" :disabled="selectedIds.length === 0">
        批量删除 ({{ selectedIds.length }})
      </button>
      <button @tap="handleSort">排序</button>
      <input v-model="searchKeyword" placeholder="搜索..." @input="handleSearch" />
    </view>

    <!-- 统计信息 -->
    <view class="stats">
      <text>总计: {{ stats.total }} 条</text>
      <text>当前页: {{ stats.currentPage }}</text>
      <text>{{ stats.hasMore ? '有更多数据' : '已加载全部' }}</text>
    </view>

    <!-- 列表 -->
    <scroll-view scroll-y :style="{ height: '400px' }" @scrolltolower="loadMore">
      <view v-for="item in state.list" :key="getItemId(item)" class="list-item">
        <!-- 选择框 -->
        <checkbox 
          :checked="selectedIds.includes(getItemId(item))" 
          @change="toggleSelect(getItemId(item))"
        />
        
        <!-- 内容 -->
        <view class="item-content">
          <text class="title">{{ item.title }}</text>
          <text class="desc">{{ item.description }}</text>
        </view>
        
        <!-- 操作按钮 -->
        <view class="item-actions">
          <button @tap="handleEdit(item)">编辑</button>
          <button @tap="handleDelete(getItemId(item))">删除</button>
        </view>
      </view>
      
      <!-- 状态显示 -->
      <view v-if="state.loading" class="loading">加载中...</view>
      <view v-if="state.isEmpty" class="empty">暂无数据</view>
      <view v-if="state.error" class="error">
        {{ state.error }}
        <button @tap="retry">重试</button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePaginationList } from '@/components/paginationList/hooks'

interface ListItem {
  id: number
  title: string
  description: string
  createdAt: string
}

const searchKeyword = ref('')
const selectedIds = ref<number[]>([])
const sortOrder = ref<'asc' | 'desc'>('desc')

// 使用分页 Hook
const {
  state,
  refresh,
  loadMore,
  retry,
  addItem,
  addItems,
  removeItem,
  removeItems,
  updateItem,
  searchItems,
  sortItems,
  getItemId,
  getStats
} = usePaginationList<ListItem>(fetchData, {
  pageSize: 20,
  debounceDelay: 300
})

// 统计信息
const stats = computed(() => getStats())

// 数据获取函数
async function fetchData(page: number, pageSize: number) {
  const response = await api.getList({ page, pageSize })
  return {
    list: response.data,
    total: response.total,
    hasMore: page * pageSize < response.total
  }
}

// 批量添加
const handleBatchAdd = () => {
  const newItems: ListItem[] = Array.from({ length: 3 }, (_, i) => ({
    id: Date.now() + i,
    title: `批量添加项目 ${i + 1}`,
    description: `这是批量添加的第 ${i + 1} 个项目`,
    createdAt: new Date().toISOString()
  }))
  
  addItems(newItems, { showErrorToast: true })
}

// 编辑项目
const handleEdit = (item: ListItem) => {
  updateItem(item.id, {
    title: item.title + ' (已编辑)',
    description: '内容已更新'
  }, { showErrorToast: true })
}

// 删除单个项目
const handleDelete = (id: number) => {
  removeItem(id, { showErrorToast: true })
  // 从选择列表中移除
  selectedIds.value = selectedIds.value.filter(selectedId => selectedId !== id)
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) return
  
  removeItems(selectedIds.value, { showErrorToast: true })
  selectedIds.value = []
}

// 切换选择状态
const toggleSelect = (id: number) => {
  const index = selectedIds.value.indexOf(id)
  if (index > -1) {
    selectedIds.value.splice(index, 1)
  } else {
    selectedIds.value.push(id)
  }
}

// 搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) return
  
  const results = searchItems({
    keyword: searchKeyword.value,
    fields: ['title', 'description'],
    caseSensitive: false
  })
  
  console.log('搜索结果:', results)
}

// 排序
const handleSort = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  
  sortItems({
    field: 'createdAt',
    order: sortOrder.value
  })
}
</script>
```

### 自定义样式

``vue
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

``vue
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
6. **scrollMode 选择**：
   - container 模式适合需要固定高度的独立列表
   - page 模式适合全页面滚动，特别是页面有其他内容如导航栏、轮播图等
   - page 模式下，列表会自动占满剩余空间，不需要设置 height

## 常见问题

### Q: 为什么无法触发加载更多？
A: 请检查 `scroll-view` 是否有足够的高度，必要时可以为容器设置固定高度。

### Q: 如何自定义加载状态？
A: 可以通过 `skeleton` 插槽自定义骨架屏，通过监听组件状态来显示自定义加载提示。

### Q: 如何处理网络错误？
A: 组件会自动捕获 `fetchData` 中抛出的错误，可以通过 `error` 插槽自定义错误展示。

### Q: 如何实现搜索功能？
A: 可以使用 Hook 的 `searchItems` 方法进行本地搜索，或在 `fetchData` 函数中根据搜索条件请求数据，然后调用 `refresh()` 方法重新加载。

### Q: CRUD 操作后数据没有更新？
A: 确保数据项有唯一的 ID 字段（id、_id、key、uuid 之一），Hook 会自动识别这些字段进行数据操作。

### Q: 如何自定义 ID 字段？
A: Hook 会自动尝试常见的 ID 字段，如果你的数据使用其他字段作为唯一标识，可以在数据项中添加 `id` 字段或使用 `getItemId` 方法获取正确的 ID。

### Q: 批量操作性能如何？
A: Hook 内部使用了 `Set` 和 `Map` 等高效数据结构，批量操作性能良好，适合处理大量数据。

### Q: 如何在 CRUD 操作时禁用错误提示？
A: 在调用 CRUD 方法时传入 `{ showErrorToast: false }` 选项：
``typescript
addItem(newItem, { showErrorToast: false })
```

### Q: 搜索和排序是否会影响服务端数据？
A: `searchItems`、`filterItems` 和 `sortItems` 只对当前已加载的本地数据进行操作，不会影响服务端数据。如需服务端搜索，请在 `fetchData` 中实现。

### Q: Hook 和组件方式有什么区别？
A: 
- **组件方式**: 提供完整的 UI 和交互，适合快速开发标准列表页面
- **Hook 方式**: 只提供数据管理逻辑，UI 完全自定义，适合复杂的业务场景和自定义需求

