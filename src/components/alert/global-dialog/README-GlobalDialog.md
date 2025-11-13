# 全局弹窗组件使用指南

本组件库提供了类似 Ant Design 的全局弹窗使用方式，支持通过命令式 API 在任何地方调用弹窗，无需手动管理组件的显示与隐藏。

## 特性

- 🌍 **全局调用**: 任何地方都可以直接调用，无需手动引入组件
- 🎯 **简洁 API**: 提供类似 `alert()` 和 `confirm()` 的便捷方法
- 🎨 **可定制**: 支持自定义内容、按钮文本和回调函数
- 🔧 **TypeScript**: 完整的类型支持，提供代码提示和类型检查
- 📱 **跨平台**: 基于 Taro 框架，支持微信小程序、H5 等多端运行

## 安装与配置

### 1. 确保插件已安装

确保在 `src/app.ts` 中已经安装了 `GlobalDialogPlugin`：

```typescript
import { GlobalDialogPlugin } from './components/alert/global-dialog/globalDialog'

const App = createApp({
  // ...应用配置
})

// 安装插件
App.use(GlobalDialogPlugin)
```

### 2. 添加容器组件

在应用的根组件（如 `layout/viewContainer.vue`）中添加 `GlobalDialogContainer` 容器组件：

```vue
<template>
  <view>
    <!-- 其他应用内容 -->
    
    <!-- 全局弹窗容器 -->
    <GlobalDialogContainer />
  </view>
</template>

<script setup lang="ts">
import GlobalDialogContainer from '~/components/alert/global-dialog/GlobalDialogContainer.vue'
</script>
```

## 使用方法

### 基本用法

```typescript
// 在任何组件或页面中
import { getCurrentInstance } from 'vue'

// 方式一：通过 inject 获取
const instance = getCurrentInstance()
const $dialog = instance?.appContext.config.globalProperties.$dialog

// 方式二：通过 Taro 全局对象获取
const { globalDialog } = Taro
```

### alert 弹窗

显示一个只有"知道了"按钮的提示弹窗：

```typescript
// 基本用法
globalDialog.alert('操作成功！')

// 返回 Promise，可以监听关闭事件
globalDialog.alert('操作成功！').then(() => {
  console.log('用户确认了提示')
})
```

### confirm 弹窗

显示一个带有"确认"和"取消"按钮的确认弹窗：

```typescript
// 基本用法
globalDialog.confirm('确定要删除这个项目吗？')

// 自定义确认按钮文本
globalDialog.confirm('确定要删除这个项目吗？', '删除')

// 返回 Promise，可以判断用户选择
globalDialog.confirm('确定要删除这个项目吗？').then((confirmed) => {
  if (confirmed) {
    // 用户点击了确认
    handleDelete()
  } else {
    // 用户点击了取消
    console.log('取消删除')
  }
})
```

### 高级用法

使用 `show` 方法进行更多自定义：

```typescript
globalDialog.show({
  content: '这是一条重要信息，请谨慎处理',
  confirmText: '我知道了',
  onConfirm: () => {
    globalDialog.hide()
    console.log('用户确认了操作')
    // 可以执行一些异步操作
    return doSomethingAsync()
  },
  onCancel: () => {
    console.log('用户取消了操作')
  }
})
```

## API

### GlobalDialogManager

全局弹窗管理器，提供以下方法：

| 方法名 | 类型 | 描述 |
| --- | --- | --- |
| `show` | `(options: DialogOptions) => Promise<boolean>` | 显示弹窗，返回 Promise，true 表示用户点击确认，false 表示取消 |
| `confirm` | `(content: string, confirmText?: string) => Promise<boolean>` | 确认弹窗的简化方法 |
| `alert` | `(content: string) => Promise<boolean>` | 提示弹窗的简化方法 |
| `hide` | `() => void` | 手动隐藏当前弹窗 |
| `reset` | `() => void` | 重置弹窗状态 |
| `getState` | `() => DialogState` | 获取当前弹窗状态 |

### DialogOptions

`show` 方法的参数选项：

| 属性名 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `content` | `string` | `''` | 弹窗内容 |
| `confirmText` | `string` | `'确定'` | 确认按钮文本 |
| `onConfirm` | `() => void \| Promise<void>` | - | 点击确认按钮的回调 |
| `onCancel` | `() => void` | - | 点击取消按钮的回调 |

### DialogState

弹窗状态对象：

| 属性名 | 类型 | 描述 |
| --- | --- | --- |
| `visible` | `boolean` | 弹窗是否可见 |
| `content` | `string` | 弹窗内容 |
| `confirmText` | `string` | 确认按钮文本 |
| `onConfirm` | `(() => void \| Promise<void>) \| undefined` | 确认回调函数 |
| `onCancel` | `(() => void) \| undefined` | 取消回调函数 |

## 注意事项

1. **异步回调**: 如果 `onConfirm` 回调是异步函数，弹窗会在异步操作完成后自动关闭
2. **错误处理**: 异步回调中的错误会被捕获，不会影响弹窗的正常关闭
3. **全局唯一**: 同时只能显示一个弹窗，新的弹窗会替换当前的弹窗
4. **容器依赖**: 必须在应用中添加 `GlobalDialogContainer` 组件才能正常使用
5. **插件注册**: 确保在 `app.ts` 中正确注册了 `GlobalDialogPlugin`

## 示例场景

### 删除确认

```typescript
const handleDelete = (id: string) => {
  globalDialog.confirm(`确定要删除该项目吗？此操作不可恢复！`).then((confirmed) => {
    if (confirmed) {
      deleteProject(id)
        .then(() => {
          globalDialog.alert('删除成功！')
        })
        .catch(() => {
          globalDialog.alert('删除失败，请稍后重试')
        })
    }
  })
}
```

### 表单提交确认

```typescript
const handleSubmit = async (formData: any) => {
  const confirmed = await globalDialog.show({
    content: '提交后不可修改，请确认信息无误',
    confirmText: '确认提交',
    onConfirm: async () => {
      await submitForm(formData)
      showToast('提交成功')
    }
  })
}
```

### 退出登录

```typescript
const handleLogout = () => {
  globalDialog.confirm('确定要退出登录吗？').then((confirmed) => {
    if (confirmed) {
      clearUserData()
      navigateToLoginPage()
    }
  })
}
```
