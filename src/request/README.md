# Taro Request 二次封装

基于 Taro.request 的类型安全网络请求封装，支持智能类型推导、统一错误处理、路径参数替换等功能。

## ✨ 核心特性

- 🔥 **TypeScript 类型安全**：完整的类型推导和检查
- 🚀 **智能参数推导**：自动推导 params、data、args 类型
- 🛡️ **统一异常处理**：无需手动 try-catch，统一错误处理
- 🔗 **路径参数替换**：支持 RESTful 风格的路径参数
- ⚙️ **灵活配置**：支持自定义 headers、timeout 等配置
- 📦 **标准化响应**：统一的响应格式，兼容后端错误码处理
- 🎯 **按需配置**：支持单个接口独立配置

## 📁 项目结构

```
src/request/
├── index.ts           # 统一导出
├── httpsRequest.ts    # 核心封装逻辑
├── interceptors.ts    # 请求拦截器
├── enum.ts           # 状态码枚举
└── apis/             # API 定义
    ├── get.ts        # GET 请求
    ├── post.ts       # POST 请求
    ├── put.ts        # PUT 请求
    └── delete.ts     # DELETE 请求
```

## 🔧 类型定义

### makeRequest 泛型参数

```typescript
makeRequest<Payload, Data, Params, Args>(config)
```

- **Payload**: 响应数据类型（data.data 或 data.rows 的类型）
- **Data**: 请求体数据类型
- **Params**: URL 查询参数类型
- **Args**: 路径参数类型（用于 URL 中的 {id} 替换）

### 响应格式

```typescript
interface ResultFormat<T> {
  data: BackendResultFormat<T> | null  // 业务数据
  err: { code: number; message: string } | null  // 错误信息
  response: Taro.request.SuccessCallbackResult | null  // 原始响应
}

interface BackendResultFormat<T> {
  code: number          // 业务状态码
  hasNext: boolean      // 是否有下一页
  hasPrevious: boolean  // 是否有上一页
  total: number         // 总数
  data: T | null        // 单个数据或数组数据
  msg: string           // 消息
  rows: T               // 列表数据
}
```

## 📖 使用指南

### 1. 基础导入

```typescript
import apis from '~/request'
```

### 2. GET 请求

#### 无参数请求
```typescript
// API 定义
'/business/banner/list': makeRequest<BannerProps[]>({
  url: '/business/banner/list',
  method: 'GET',
})

// 调用方式
const result = await apis.get['/business/banner/list']({})
// 访问数据：result.data?.data (BannerProps[] | null)
```

#### 带查询参数请求
```typescript
// API 定义
'/category/list': makeRequest<CategoryProps[], { pageSize: number; pageNum: number }>({
  url: '/category/list',
  method: 'GET',
})

// 调用方式
const result = await apis.get['/category/list']({
  params: {
    pageSize: 10,
    pageNum: 1
  }
})
```

### 3. POST 请求

#### 创建资源
```typescript
// API 定义
'/business/skyUserAddresses': makeRequest<null, {
  receiverName: string
  receiverPhone: string
  province: string
  // ... 其他字段
}>({
  url: '/business/skyUserAddresses',
  method: 'POST',
})

// 调用方式
const result = await apis.post['/business/skyUserAddresses']({
  data: {
    receiverName: '张三',
    receiverPhone: '13800138000',
    province: '广东省',
    // ... 其他字段
  }
})
```

#### 登录接口
```typescript
// API 定义
'/auth/login': makeRequest<
  { isBindMobile: boolean; access_token: string },
  {
    clientId: string
    grantType: string
    xcxCode: string
    appid: string
  }
>({
  url: '/auth/login',
  method: 'POST',
})

// 调用方式
const result = await apis.post['/auth/login']({
  data: {
    clientId: 'your-client-id',
    grantType: 'authorization_code',
    xcxCode: 'wx-code',
    appid: 'your-appid'
  }
})
// 访问数据：result.data?.data?.access_token
```

### 4. PUT 请求

```typescript
// API 定义
'/business/skyUserAddresses': makeRequest<null, {
  id: string
  receiverName: string
  // ... 其他字段
}>({
  url: '/business/skyUserAddresses',
  method: 'PUT',
})

// 调用方式
const result = await apis.put['/business/skyUserAddresses']({
  data: {
    id: '123',
    receiverName: '李四',
    // ... 其他字段
  }
})
```

### 5. DELETE 请求（路径参数）

#### API 定义
```typescript
// 在 apis/delete.ts 中
'/business/skyUserAddresses/{ids}': makeRequest<null, undefined, undefined, { ids: string }>(
{
  url: '/business/skyUserAddresses/{ids}',
  method: 'DELETE',
})
```

#### 调用方式
```typescript
// 删除单个地址
const result = await apis.delete['/business/skyUserAddresses/{ids}']({
  args: {
    ids: '123'  // 会替换 URL 中的 {ids}
  }
})

// 删除多个地址（如果后端支持逗号分隔）
const result = await apis.delete['/business/skyUserAddresses/{ids}']({
  args: {
    ids: '123,456,789'
  }
})
```

### 6. 复杂路径参数示例

```typescript
// API 定义
'/users/{userId}/orders/{orderId}': makeRequest<
  OrderDetail,
  undefined,
  { includeItems: boolean },
  { userId: string; orderId: string }
>({
  url: '/users/{userId}/orders/{orderId}',
  method: 'GET',
})

// 调用方式
const result = await apis.get['/users/{userId}/orders/{orderId}']({
  args: {
    userId: '123',
    orderId: '456'
  },
  params: {
    includeItems: true
  }
})
// 实际请求 URL: /users/123/orders/456?includeItems=true
```

## 🔍 错误处理

### 统一错误处理
```typescript
const result = await apis.get['/business/banner/list']({})

if (result.err) {
  // 处理错误
  console.error('请求失败:', result.err.message)
  Taro.showToast({
    title: result.err.message,
    icon: 'error'
  })
  return
}

// 处理成功数据
const banners = result.data?.data || []
```

### 业务逻辑中的使用
```typescript
const getData = async () => {
  const [banner, recommend, comment] = await Promise.all([
    apis.get['/business/banner/list']({}),
    apis.get['/business/skyRecommendProduct/list']({}),
    apis.get['/reviewService/latestList']({}),
  ])

  // 轮播图数据在 data.data 中
  state.swiperList = banner.data?.data || []
  
  // 推荐商品数据在 data.rows 中
  state.recommendList = recommend.data?.rows || []
  
  // 评论数据在 data.rows 中
  state.commentList = comment.data?.rows || []
}
```

## ⚙️ 高级配置

### 自定义请求头
```typescript
const result = await apis.post['/upload']({
  data: formData,
  header: {
    'Content-Type': 'multipart/form-data'
  }
})
```

### 自定义超时时间
```typescript
const result = await apis.get['/long-request']({
  timeout: 30000  // 30秒超时
})
```

## 🚨 注意事项

1. **类型安全**：始终使用 TypeScript，避免使用 `any` 类型
2. **错误处理**：每个请求都要检查 `result.err`
3. **数据访问**：根据后端返回结构访问 `result.data?.data` 或 `result.data?.rows`
4. **路径参数**：使用 `args` 参数进行路径替换，确保参数名与 URL 中的占位符一致
5. **请求体**：POST/PUT 请求使用 `data` 参数传递请求体
6. **查询参数**：使用 `params` 参数传递 URL 查询参数

## 🔗 相关文件

- `src/request/httpsRequest.ts` - 核心封装逻辑
- `src/request/interceptors.ts` - 请求拦截器配置
- `src/request/enum.ts` - HTTP 状态码枚举
- `src/pages/index/type.ts` - 业务类型定义示例
