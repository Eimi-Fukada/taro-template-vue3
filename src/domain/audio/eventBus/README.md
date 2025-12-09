# AudioEventBus 文档

## 1. 概述

`AudioEventBus` 是专为音频模块设计的全局事件总线，用于在 Vue + Taro 应用中实现跨组件、跨页面的音频状态通信。

### 核心特性

- **🚀 异步微任务调度**：基于 `Promise.resolve().then()` 实现异步触发，避免阻塞主线程
- **🔒 防重复注册**：使用 `Set` 数据结构，确保同一事件监听器不会重复注册
- **🎯 生命周期管理**：支持 `once`、`off`、`removeAll` 等完整的监听器管理
- **🌐 全局唯一性**：独立于 Vue 组件树，页面卸载不会自动销毁，实现真正的跨页面通信
- **🏷️ 事件领域化**：专门用于音频模块的事件命名，避免全局事件冲突
- **🛡️ 安全派发机制**：遍历事件监听器时使用浅拷贝，避免回调中修改监听器导致的错误

---

## 2. API 参考

### 2.1 实例创建

```typescript
import { AudioEventBus } from '~/domain/audio/eventBus'

// 创建新实例
const audioEventBus = new AudioEventBus()

// 使用预定义的全局实例（推荐）
import { audioEventBus } from '~/domain/audio/eventBus'
```

### 2.2 事件监听

#### `on(event, listener)`
注册事件监听器

```typescript
audioEventBus.on('audio:play', (payload) => {
  console.log('播放事件', payload)
})
```

**参数**
- `event: string` - 事件名称
- `listener: (payload) => void` - 回调函数

**返回值** - `this`，支持链式调用

#### `once(event, listener)`
注册一次性事件监听器，触发后自动移除

```typescript
audioEventBus.once('audio:error', (err) => {
  console.log('播放出错', err)
})
```

#### `off(event, listener)`
移除指定的事件监听器

```typescript
const fn = (payload) => console.log(payload)
audioEventBus.on('audio:pause', fn)

// 移除监听器
audioEventBus.off('audio:pause', fn)
```

### 2.3 事件管理

#### `removeAll(event?)`
移除事件监听器

```typescript
// 清空指定事件的所有监听器
audioEventBus.removeAll('audio:timeupdate')

// 清空所有事件监听器
audioEventBus.removeAll()
```

### 2.4 事件触发

#### `emit(event, payload?)`
触发事件（异步微任务）

```typescript
audioEventBus.emit('audio:play', { 
  chapterId: '123', 
  currentTime: 0 
})
```

**特点**
- 异步派发，确保调用不会阻塞主线程
- 派发期间遍历监听器使用浅拷贝，保证在事件回调中注册或移除监听器不会报错

---

## 3. 内置事件类型

```typescript
export const AudioEvent = {
  PLAY: 'audio:play',           // 开始播放
  PAUSE: 'audio:pause',         // 暂停播放
  SEEK_START: 'audio:seek_start', // 开始拖动进度条
  SEEK_END: 'audio:seek_end',   // 结束拖动进度条
  TIME_UPDATE: 'audio:timeupdate', // 播放进度更新
  META_UPDATE: 'audio:meta_update', // 音频元数据更新
  ERROR: 'audio:error',         // 播放错误
  NEXT: 'audio:next',          // 切换到下一章节
  PREV: 'audio:prev',          // 切换到上一章节
} as const
```

---

## 4. 使用示例

### 基础用法

```typescript
import { audioEventBus, AudioEvent } from '~/domain/audio/eventBus'
import { onMounted, onUnmounted } from 'vue'

// 页面组件中的使用
export default {
  setup() {
    // 播放事件监听
    const handlePlay = ({ chapterId, currentTime }) => {
      console.log('开始播放', chapterId, currentTime)
      // 更新UI状态
    }

    // 错误事件监听（一次性）
    const handleError = ({ message }) => {
      console.error('播放出错', message)
      // 显示错误提示
    }

    onMounted(() => {
      audioEventBus.on(AudioEvent.PLAY, handlePlay)
      audioEventBus.once(AudioEvent.ERROR, handleError)
    })

    onUnmounted(() => {
      // 页面卸载时清理事件监听
      audioEventBus.off(AudioEvent.PLAY, handlePlay)
      // 或者清理所有监听器
      // audioEventBus.removeAll()
    })

    return {}
  }
}
```

### 跨页面通信示例

```typescript
// 页面A：播放控制页面
import { audioEventBus, AudioEvent } from '~/domain/audio/eventBus'

const playAudio = (chapterId) => {
  // 播放音频并通知其他页面
  audioEventBus.emit(AudioEvent.PLAY, { chapterId, currentTime: 0 })
}

// 页面B：播放详情页
import { audioEventBus, AudioEvent } from '~/domain/audio/eventBus'

onMounted(() => {
  // 监听播放事件，同步UI状态
  audioEventBus.on(AudioEvent.PLAY, ({ chapterId, currentTime }) => {
    if (chapterId === currentChapterId) {
      updateProgressBar(currentTime)
    }
  })
})
```

---

## 5. 与 Taro eventCenter 对比

| 特性 | Taro eventCenter | AudioEventBus |
|------|------------------|---------------|
| **触发方式** | 同步触发 | 基于微任务异步派发 |
| **重复注册** | 无重复保护 | Set 结构防止重复 |
| **once 支持** | 需手动移除 | 原生支持 |
| **组件独立性** | 依赖 Taro Page/Component | 独立全局实例 |
| **类型安全** | 无类型约束 | TypeScript 泛型支持 |
| **遍历安全** | 回调修改监听器可能报错 | 浅拷贝安全机制 |
| **事件领域化** | 无领域概念 | 专为音频模块设计 |

---

## 6. 最佳实践

### 6.1 命名规范

- 使用 `audio:` 前缀标识音频相关事件
- 使用清晰的事件名称，如 `audio:play`、`audio:timeupdate`
- 保持事件命名的一致性和可预测性

### 6.2 生命周期管理

```typescript
// ✅ 推荐：及时清理事件监听器
onUnmounted(() => {
  audioEventBus.removeAll()
})

// ❌ 避免：忘记清理可能导致内存泄漏
```

### 6.3 错误处理

```typescript
// ✅ 推荐：在事件回调中处理异常
audioEventBus.on(AudioEvent.PLAY, (payload) => {
  try {
    updatePlayerState(payload)
  } catch (error) {
    console.error('处理播放事件失败:', error)
  }
})
```

### 6.4 类型安全

```typescript
// 定义事件载荷类型
interface PlayEventPayload {
  chapterId: string
  currentTime: number
}

// 类型安全的事件监听
audioEventBus.on<PlayEventPayload>(AudioEvent.PLAY, (payload) => {
  // payload 具有 TypeScript 类型检查
  console.log(payload.chapterId)
})
```

---

## 总结

`AudioEventBus` 专为音频模块的跨页面、跨组件通信场景设计，相比 Taro 原生事件中心，提供了类型安全、微任务异步调度、完整的生命周期管理和领域化事件等高级特性，特别适合音频播放器这种需要复杂状态同步的业务场景。
