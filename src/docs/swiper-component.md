# 横向滚动组件使用案例

## 方案一：配置驱动 + Swiper 组件实现

### 特点
- 比 `v-if` 条件渲染更易开发和维护
- 使用配置数组管理多个页面组件
- 支持动态组件渲染
- 代码结构清晰，便于扩展

### 完整实现示例

#### 1. 配置定义
```typescript
import { markRaw } from 'vue'
import CoursesIntro from './components/CoursesIntro.vue'
import CoursesSchedule from './components/CoursesSchedule.vue'
import CoursesComment from './components/CoursesComment.vue'
import CoursesRecommend from './components/CoursesRecommend.vue'

const commentListRef = ref(null) as any

// Swiper 配置数组 - 管理所有页面组件
const SWIPER_CONFIG = computed(() => [
  // 简介
  {
    key: 'intro',
    component: markRaw(CoursesIntro), // markRaw 优化性能，避免不必要的响应式转换
    props: {
      principalList: state.principalInfoList || [],
      highlights: state.data.highlights || '',
      syllabusImageUrl: state.data.syllabusImageUrl || '',
      purchaseNotice: state.data.purchaseNotice || '',
      copyrightStatement: state.data.copyrightStatement || '',
    },
  },
  // 课程表
  {
    key: 'schedule',
    component: markRaw(CoursesSchedule),
    props: {
      chapterList: state.chapterList,
    },
  },
  // 评价
  {
    key: 'comment',
    component: markRaw(CoursesComment),
    props: {
      allowComment: true,
      maxLength: 500,
      showEmoji: true,
    },
    events: {
      // 注意这里的 onChange 事件名
      // 子组件向外 emit 的是 change 事件，而不是 onChange
      onChange: handleCommentChange,
    },
    ref: commentListRef,
  },
  // 相关推荐
  {
    key: 'recommend',
    component: markRaw(CoursesRecommend),
    props: {
      limit: 10,
      category: 'all',
      showRating: true,
    },
  },
])

onMounted(() => {
  nextTick(() => {
    if (commentListRef.value) {
      commentListRef.value?.refresh()
    }
  })
})
```

#### 2. 模板使用
```vue
<template>
  <Swiper
    class="w-full flex-1"
    :current="state.current"
    :indicatorDots="false"
    @change="(e) => (state.current = e.detail.current)"
  >
    <swiper-item v-for="config in SWIPER_CONFIG" :key="config.key">
      <scroll-view 
        :scroll-y="true" 
        :enhanced="true" 
        class="w-full h-full"
      >
        <!-- 动态组件渲染，传递对应 props -->
        <component 
          :is="config.component" 
          v-bind="{ ...config.props, ...config.events }"
          :ref="(el) => config.ref && (config.ref.value = el)"
        />
      </scroll-view>
    </swiper-item>
  </Swiper>
</template>
```

#### 3. 状态管理
```typescript
// 响应式状态
const state = reactive({
  current: 0, // 当前显示的页面索引
  
  // 页面数据
  principalInfoList: [],
  data: {
    highlights: '',
    syllabusImageUrl: '',
    purchaseNotice: '',
    copyrightStatement: '',
  },
  chapterList: [],
})
```

### 优势对比

| 方案 | 配置驱动 + Swiper | v-if 条件渲染 |
|------|-------------------|---------------|
| **开发维护性** | ✅ 配置集中管理，易于扩展 | ❌ 逻辑分散，难以维护 |
| **代码可读性** | ✅ 结构清晰，一目了然 | ❌ 大量 v-if，逻辑混乱 |
| **性能表现** | ✅ 组件复用，按需加载 | ⚠️ 全量渲染，性能较差 |
| **扩展性** | ✅ 新增页面只需添加配置 | ❌ 需要修改多处代码 |
| **类型安全** | ✅ 配置可定义类型 | ❌ 容易出现 props 错误 |

### 适用场景
- **课程详情页**：简介、目录、评价、推荐等多个 Tab
- **商品详情页**：详情、规格、评价、推荐等内容
- **用户中心**：个人信息、订单、设置等功能模块
- **内容展示页**：文章、图片、视频等多媒体内容

### 最佳实践

#### 1. 性能优化
```typescript
// 使用 markRaw 避免不必要的响应式转换
const SWIPER_CONFIG = [
  {
    key: 'intro',
    component: markRaw(CoursesIntro), // ✅ 推荐使用
    props: { /* ... */ },
  }
]

// 避免动态导入导致的性能问题
const CoursesIntro = () => import('./components/CoursesIntro.vue') // ❌ 不推荐
```

#### 2. 类型安全
```typescript
// 定义配置类型
interface SwiperConfig {
  key: string
  component: Component
  props: Record<string, any>
}

// 类型安全的配置
const SWIPER_CONFIG: SwiperConfig[] = [
  // ...
]
```

#### 3. 动态配置
```typescript
// 根据权限动态生成配置
const generateSwiperConfig = () => {
  const baseConfig = [
    { key: 'intro', component: CoursesIntro, props: { /* ... */ } },
    { key: 'schedule', component: CoursesSchedule, props: { /* ... */ } },
  ]
  
  // 根据权限添加额外页面
  if (hasCommentPermission.value) {
    baseConfig.push({
      key: 'comment',
      component: CoursesComment,
      props: { /* ... */ },
    })
  }
  
  return baseConfig
}

const SWIPER_CONFIG = computed(generateSwiperConfig)
```

### 扩展功能

#### 1. 自定义指示器
```vue
<template>
  <view class="relative">
    <Swiper /* ... */>
      <!-- swiper 内容 -->
    </Swiper>
    
    <!-- 自定义指示器 -->
    <view class="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
      <view 
        v-for="(config, index) in SWIPER_CONFIG" 
        :key="config.key"
        :class="[
          'w-2 h-2 rounded-full transition-all',
          state.current === index 
            ? 'bg-blue-500 w-8' 
            : 'bg-gray-300'
        ]"
        @tap="state.current = index"
      />
    </view>
  </view>
</template>
```

#### 2. 页面切换动画
```vue
<template>
  <Swiper
    :current="state.current"
    :duration="300"
    :easing-function="'easeInOutCubic'"
  >
    <!-- swiper 内容 -->
  </Swiper>
</template>
```

### 注意事项

1. **组件懒加载**：对于复杂组件，考虑使用 `defineAsyncComponent` 实现懒加载
2. **内存管理**：及时清理不再使用的组件实例
3. **Props 传递**：确保传递的 props 与组件定义匹配
4. **平台兼容性**：测试在不同平台的兼容性（微信小程序、H5、App）

这种配置驱动的方式相比传统的 `v-if` 条件渲染，在代码组织、维护性和扩展性方面都有明显优势，特别适合多页面内容展示的场景。
