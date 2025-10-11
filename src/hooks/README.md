# 自定义 Hooks 文档

## `useTaroIntersectionObserver`

用于监听目标元素是否进入视口或指定容器的可见区域。

### 使用示例

```typescript
import { useTaroIntersectionObserver } from './useIntersectionObserver';

const { isObserving, lastEntry, error, start, stop } = useTaroIntersectionObserver(
  '#target_element',
  (entry, visible) => {
    console.log('元素可见状态变化:', visible, entry);
  },
  {
    relativeTo: 'viewport', // 或传入选择器如 '.scroll-container'
    margins: { top: 10 },   // 设置边距
    autoStart: true,       // 自动开始监听
  }
);
```

### 参数说明

| 参数名      | 类型                                                                 | 默认值       | 描述                                                                 |
|-------------|----------------------------------------------------------------------|--------------|----------------------------------------------------------------------|
| `selector`  | `string`                                                            | -            | 要监听的目标元素选择器（例如 `'#target_element'`）。                |
| `onChange`  | `(entry: ObserveEntry, visible: boolean) => void`                   | -            | 回调函数，当目标元素的可见状态变化时触发。`entry` 包含详细的交叉信息，`visible` 表示是否可见。 |
| `opts`      | `UseObserverOptions`                                                | `{}`         | 可选的配置项，包含以下字段：                                         |
|             | - `relativeTo?: 'viewport' \| string`                                | `'viewport'` | 指定相对于视口（`'viewport'`）或某个容器（传入选择器字符串）进行监听。 |
|             | - `margins?: { top?: number; bottom?: number; left?: number; right?: number }` | `{}`         | 设置监听区域的边距（例如 `{ top: 10 }`）。                           |
|             | - `autoStart?: boolean`                                             | `true`       | 是否在组件挂载后自动开始监听。                                       |

### 返回值

| 返回值名      | 类型                          | 描述                                                                 |
|---------------|-------------------------------|----------------------------------------------------------------------|
| `isObserving` | `Ref<boolean>`                | 当前是否正在监听目标元素。                                           |
| `lastEntry`   | `Ref<ObserveEntry \| null>`   | 最后一次的交叉信息。                                                 |
| `error`       | `Ref<Error \| string \| null>` | 错误信息，如果监听过程中发生错误。                                   |
| `start`       | `() => void`                  | 手动开始监听。                                                       |
| `stop`        | `() => void`                  | 手动停止监听。                                                       |

### 注意事项

1. **页面实例要求**：必须在页面内（有 `page` 实例）调用 `start`，否则会跳过并给出警告。
2. **自动清理**：组件卸载时会自动停止监听，防止内存泄漏。
3. **回调错误处理**：回调函数中的错误会被捕获，不会影响监听器的正常运行。
4. **性能优化**：如果监听多个元素，建议复用同一个 `IntersectionObserver` 实例。
5. **兼容性**：确保目标平台支持 `IntersectionObserver` API。