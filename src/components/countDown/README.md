# CountDown 倒计时组件

一个功能完整的倒计时组件，支持秒数倒计时和时间戳倒计时两种模式，具备自动开始、暂停、重置等功能。

## 📦 安装使用

```vue
<template>
  <CountDown :time="60" @on-finish="handleFinish" />
</template>

<script setup lang="ts">
import CountDown from '~/components/countDown'

const handleFinish = () => {
  console.log('倒计时结束')
}
</script>
```

## 🎯 功能特性

- ✅ **双模式支持**：秒数倒计时 + 时间戳倒计时
- ✅ **自动开始**：组件挂载后自动开始倒计时
- ✅ **灵活格式化**：支持多种时间显示格式
- ✅ **完整控制**：开始、暂停、重置、重启
- ✅ **毫秒精度**：支持毫秒级倒计时
- ✅ **插槽定制**：支持自定义显示样式
- ✅ **TypeScript**：完整的类型定义

## 📋 Props 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `time` | `number` | `0` | 倒计时时间（秒），基础模式 |
| `endTime` | `number` | - | 结束时间戳（毫秒），优先级高于 time |
| `autoStart` | `boolean` | `true` | 是否自动开始倒计时 |
| `format` | `string` | `'HH:mm:ss'` | 时间格式化模板 |
| `paused` | `boolean` | `false` | 是否暂停倒计时 |
| `millisecond` | `boolean` | `false` | 是否启用毫秒精度 |

## 🎨 格式化模板

支持以下格式化占位符：

| 占位符 | 说明 | 示例 |
|--------|------|------|
| `DD` | 天数（补零） | `01` |
| `HH` | 小时（补零） | `23` |
| `mm` | 分钟（补零） | `59` |
| `ss` | 秒数（补零） | `30` |
| `SSS` | 毫秒（补零） | `999` |

### 常用格式示例

```typescript
// 基础格式
format: 'HH:mm:ss'        // 输出: 01:30:25
format: 'mm分ss秒'        // 输出: 30分25秒
format: 'ss'              // 输出: 25

// 包含天数
format: 'DD天HH时mm分ss秒' // 输出: 01天12时30分25秒

// 毫秒精度
format: 'mm:ss.SSS'       // 输出: 30:25.999
```

## 🔔 Events 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `on-finish` | - | 倒计时结束时触发 |
| `on-change` | `timeData: TimeData` | 倒计时变化时触发 |
| `on-pause` | - | 暂停时触发 |
| `on-restart` | - | 重启时触发 |

### TimeData 类型定义

```typescript
interface TimeData {
  readonly days: number      // 天数
  readonly hours: number     // 小时
  readonly minutes: number   // 分钟
  readonly seconds: number   // 秒数
  readonly milliseconds: number // 毫秒
}
```

## 🎪 使用示例

### 1. 基础秒数倒计时

```vue
<template>
  <!-- 60秒倒计时 -->
  <CountDown :time="60" @on-finish="handleFinish" />
</template>

<script setup lang="ts">
import CountDown from '~/components/countDown'

const handleFinish = () => {
  console.log('倒计时结束')
}
</script>
```

### 2. 时间戳倒计时

```vue
<template>
  <!-- 30秒后结束 -->
  <CountDown 
    :end-time="endTime" 
    format="mm:ss"
    @on-finish="handleFinish" 
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CountDown from '~/components/countDown'

const endTime = ref(Date.now() + 30000) // 30秒后

const handleFinish = () => {
  console.log('时间戳倒计时结束')
}
</script>
```

### 3. 验证码倒计时

```vue
<template>
  <button 
    :disabled="isCountingDown" 
    @tap="sendCode"
    class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
  >
    <CountDown 
      v-if="isCountingDown"
      :time="60" 
      format="ss秒后重发"
      @on-finish="handleCountdownFinish"
    />
    <span v-else>发送验证码</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CountDown from '~/components/countDown'

const isCountingDown = ref(false)

const sendCode = () => {
  // 发送验证码逻辑
  console.log('发送验证码')
  isCountingDown.value = true
}

const handleCountdownFinish = () => {
  isCountingDown.value = false
}
</script>
```

### 4. 自定义样式（插槽）

```vue
<template>
  <CountDown :time="3600" @on-finish="handleFinish">
    <template #default="{ timeData, formattedTime }">
      <view class="flex gap-2 items-center">
        <view class="bg-red-500 text-white px-2 py-1 rounded">
          {{ String(timeData.hours).padStart(2, '0') }}
        </view>
        <text>:</text>
        <view class="bg-red-500 text-white px-2 py-1 rounded">
          {{ String(timeData.minutes).padStart(2, '0') }}
        </view>
        <text>:</text>
        <view class="bg-red-500 text-white px-2 py-1 rounded">
          {{ String(timeData.seconds).padStart(2, '0') }}
        </view>
      </view>
    </template>
  </CountDown>
</template>
```

### 5. 手动控制倒计时

```vue
<template>
  <view class="space-y-4">
    <CountDown 
      ref="countdownRef"
      :time="120" 
      :auto-start="false"
      @on-finish="handleFinish"
    />
    
    <view class="flex gap-2">
      <button @tap="start" class="px-3 py-1 bg-green-500 text-white rounded">
        开始
      </button>
      <button @tap="pause" class="px-3 py-1 bg-yellow-500 text-white rounded">
        暂停
      </button>
      <button @tap="reset" class="px-3 py-1 bg-blue-500 text-white rounded">
        重置
      </button>
      <button @tap="restart" class="px-3 py-1 bg-purple-500 text-white rounded">
        重启
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CountDown from '~/components/countDown'

const countdownRef = ref()

const start = () => countdownRef.value?.start()
const pause = () => countdownRef.value?.pause()
const reset = () => countdownRef.value?.reset()
const restart = () => countdownRef.value?.restart()

const handleFinish = () => {
  console.log('倒计时结束')
}
</script>
```

### 6. 毫秒精度倒计时

```vue
<template>
  <CountDown 
    :time="10" 
    :millisecond="true"
    format="ss.SSS"
    @on-finish="handleFinish"
  />
</template>

<script setup lang="ts">
const handleFinish = () => {
  console.log('毫秒倒计时结束')
}
</script>
```

## 🔧 方法调用

通过 `ref` 可以调用组件的方法：

```typescript
interface CountDownMethods {
  start(): void    // 开始倒计时
  stop(): void     // 停止倒计时
  pause(): void    // 暂停倒计时
  reset(): void    // 重置倒计时
  restart(): void  // 重启倒计时
}
```

## ⚠️ 注意事项

### 1. 时间参数优先级
- `endTime`（时间戳）优先级高于 `time`（秒数）
- 如果同时传入，会使用 `endTime`

### 2. 自动开始行为
- `autoStart: true`（默认）：组件挂载后自动开始
- `autoStart: false`：需要手动调用 `start()` 方法

### 3. 时间戳模式注意
- `endTime` 应该是未来的时间戳（毫秒）
- 如果传入过去的时间戳，倒计时会立即结束

### 4. 性能考虑
- 毫秒模式（`millisecond: true`）会更频繁更新，注意性能影响
- 建议只在需要高精度显示时启用毫秒模式

## 🐛 常见问题

### Q: 为什么倒计时没有开始？
A: 检查以下几点：
1. 确认 `time` 或 `endTime` 是否正确传入
2. 检查 `autoStart` 是否为 `true`
3. 如果使用 `endTime`，确认时间戳是未来时间

### Q: 如何实现验证码倒计时？
A: 参考上面的"验证码倒计时"示例，结合按钮禁用状态使用

### Q: 如何自定义显示样式？
A: 使用默认插槽，可以访问 `timeData` 和 `formattedTime` 数据

### Q: 倒计时结束后如何重新开始？
A: 调用 `restart()` 方法，或者重新设置 `time`/`endTime` 属性

## 🎨 样式定制

组件使用 CSS Modules，可以通过以下方式自定义样式：

```less
// 在你的样式文件中
.customCountdown {
  :global(.countdown-container) {
    font-size: 24px;
    font-weight: bold;
    color: #ff4757;
  }
}
```

## 🔗 相关组件

- [CodeInput](../codeInput/README.md) - 验证码输入组件（内置倒计时功能）
- [ActionSheet](../actionSheet/README.md) - 操作选择器组件