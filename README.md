# Taro Vue3 TypeScript 跨平台开发模板

基于 Taro 4.1.5 + Vue 3.5.18 + TypeScript 5.9.2 的现代化跨平台开发模板，支持微信小程序、H5、支付宝小程序等多端部署。

## 🚀 技术栈

- **框架**: Taro 4.1.5 + Vue 3.5.18
- **语言**: TypeScript 5.9.2
- **状态管理**: Pinia 3.0.3
- **样式方案**: TailwindCSS 3.4.17 + Less + CSS Modules
- **UI组件**: NutUI-Taro 4.3.14 + Taro-UI 3.3.0
- **构建工具**: Webpack 5 + Babel
- **代码规范**: ESLint + Prettier + Stylelint + Commitlint
- **工具库**: es-toolkit + dayjs

## 📁 项目结构

```
taro-template/
├── .husky/                  # Git hooks，包含提交规则和代码检测
├── .vscode/                 # VS Code 编辑器配置
├── config/                  # 构建配置
│   ├── index.ts             # 主配置文件
│   ├── dev.ts               # 开发环境配置
│   └── prod.ts              # 生产环境配置
├── dist/                    # 构建输出目录
├── src/
│   ├── assets/              # 静态资源
│   │   ├── fonts/           # 字体文件
│   │   └── icon-image/      # 图标和图片资源
│   ├── components/          # 业务通用组件
│   │   ├── actionSheet/     # 操作面板组件
│   │   ├── chooseImage/     # 图片选择组件
│   │   ├── codeInput/       # 验证码输入组件
│   │   ├── countDown/       # 倒计时组件
│   │   ├── customPicker/    # 自定义选择器
│   │   ├── mask/            # 遮罩组件
│   │   ├── navigation/      # 导航组件
│   │   ├── paginationList/  # 分页列表组件
│   │   ├── starLevel/       # 星级评分组件
│   │   ├── tabs/            # 标签页组件
│   │   ├── textArea/        # 文本域组件
│   │   ├── timepiece/       # 计时器组件
│   │   └── upload/          # 上传组件
│   ├── custom-tab-bar/      # 自定义底部 TabBar
│   ├── enums/               # 枚举定义
│   │   └── sex.ts           # 性别枚举
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useDoubleClick.ts # 双击处理 hook
│   │   └── useSuperLock.ts  # 防重复操作锁定 hook
│   ├── layout/              # 布局组件
│   │   ├── viewContainer.vue # 视图容器组件
│   │   └── index.module.less # 布局样式
│   ├── pages/               # 页面目录
│   │   ├── index/           # 首页
│   │   └── mine/            # 个人中心
│   ├── request/             # 网络请求模块
│   │   ├── apis/            # API 接口定义
│   │   │   ├── get.ts       # GET 请求接口
│   │   │   ├── post.ts      # POST 请求接口
│   │   │   ├── put.ts       # PUT 请求接口
│   │   │   └── delete.ts    # DELETE 请求接口
│   │   ├── enum.ts          # 请求相关枚举
│   │   ├── httpsRequest.ts  # HTTP 请求封装
│   │   ├── interceptors.ts  # 请求拦截器
│   │   ├── index.ts         # 请求模块入口
│   │   └── README.md        # 请求模块文档
│   ├── stores/              # Pinia 状态管理
│   │   └── counter.ts       # 计数器状态示例
│   ├── styles/              # 全局样式
│   │   ├── help.less        # 辅助样式
│   │   └── theme.less       # 主题样式
│   ├── utils/               # 工具函数
│   │   ├── help.ts          # 辅助函数
│   │   └── lib.ts           # 工具库
│   ├── app.config.ts        # 应用配置
│   ├── app.less             # 全局样式入口
│   ├── app.ts               # 应用入口
│   ├── config.ts            # 环境配置
│   ├── globalStorage.ts     # 全局存储管理
│   └── index.html           # H5 入口文件
├── .commitlintrc.js         # Git 提交规范配置
├── .editorconfig            # 编辑器配置
├── .eslintignore            # ESLint 忽略配置
├── .eslintrc.js             # ESLint 配置
├── .gitignore               # Git 忽略配置
├── .lintstagedrc            # lint-staged 配置
├── .npmrc                   # npm 配置
├── .prettierrc.js           # Prettier 配置
├── .stylelintrc.js          # Stylelint 配置
├── babel.config.js          # Babel 配置
├── global.d.ts              # 全局类型声明
├── package.json             # 项目依赖和脚本
├── postcss.config.js        # PostCSS 配置
├── project.config.json      # 小程序项目配置
├── project.private.config.json # 小程序私有配置
├── project.tt.json          # 头条小程序配置
├── tailwind.config.js       # TailwindCSS 配置
├── tsconfig.json            # TypeScript 配置
├── vue.config.js            # Vue 配置
└── yarn.lock                # 依赖锁定文件
```

## 🛠️ 开发环境

### 环境要求

- **Node.js**: v16+ (推荐 v18+)
- **包管理器**: Yarn 1.22.22+
- **编辑器**: VS Code (推荐)

### 快速开始

```bash
# 克隆项目
git clone <repository-url>
cd taro-template

# 安装依赖
yarn install

# 启动开发服务器
yarn dev          # H5 开发环境
yarn prod         # H5 生产环境

# 小程序开发
yarn dev:weapp    # 微信小程序
yarn dev:alipay   # 支付宝小程序
yarn dev:tt       # 头条小程序
```

### 构建部署

```bash
# H5 构建
yarn build        # 开发环境构建
yarn build:prod   # 生产环境构建

# 小程序构建
yarn build:weapp  # 微信小程序
yarn build:alipay # 支付宝小程序
yarn build:tt     # 头条小程序
```

## 📋 开发规范

### 代码规范

- **ESLint**: 代码语法和规范检查
- **Prettier**: 代码格式化
- **Stylelint**: 样式代码检查
- **TypeScript**: 严格类型检查

### Git 提交规范

使用 Conventional Commits 规范：

```bash
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 组件开发规范

每个组件遵循以下结构：

```
ComponentName/
├── ComponentName.vue     # 主组件文件
├── index.ts              # 导出文件
├── types.ts              # 类型定义
├── index.module.less     # 样式文件（可选）
└── README.md             # 组件文档（可选）
```

### 页面开发规范

每个页面遵循 MVVM 架构：

```
pageName/
├── index.vue             # 页面组件
├── index.config.ts       # 页面配置
├── viewModel.ts          # 页面逻辑（ViewModel 层）
├── types.ts              # 页面类型定义（可选）
├── components/           # 页面专用组件（可选）
└── index.module.less     # 页面样式（可选）
```

## 🎨 样式方案

### TailwindCSS

项目主要使用 TailwindCSS 进行快速开发：

```vue
<template>
  <view class="flex items-center justify-center p-4 bg-white rounded-md shadow-sm">
    <text class="text-lg font-bold text-gray-800">Hello World</text>
  </view>
</template>
```

### CSS Modules

复杂样式使用 CSS Modules：

```vue
<template>
  <view :class="styles.container">
    <text :class="styles.title">Title</text>
  </view>
</template>

<script setup lang="ts">
import styles from './index.module.less'
</script>
```

## 🔧 核心功能

### 网络请求

基于 Taro.request 封装的请求模块，支持拦截器、错误处理等：

```typescript
import { get, post } from '@/request'

// GET 请求
const userInfo = await get('/api/user/info')

// POST 请求
const result = await post('/api/user/update', { name: 'John' })
```

### 状态管理

使用 Pinia 进行状态管理：

```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  
  const setUserInfo = (info) => {
    userInfo.value = info
  }
  
  return { userInfo, setUserInfo }
})
```

### 组件库

项目内置多个业务组件：

- **PaginationList**: 分页列表组件
- **ActionSheet**: 操作面板组件
- **CountDown**: 倒计时组件
- **StarLevel**: 星级评分组件
- 更多组件请查看 `src/components/` 目录

## 🌐 跨平台支持

### 支持平台

- ✅ 微信小程序
- ✅ H5
- ✅ 支付宝小程序
- ✅ 头条小程序
- ✅ QQ 小程序

### 平台差异处理

使用条件编译处理平台差异：

```typescript
// #ifdef H5
import { showToast } from '@tarojs/taro'
// #endif

// #ifdef WEAPP
import Taro from '@tarojs/taro'
// #endif
```

## 📚 文档

- [组件文档](src/components/README.md)
- [请求模块文档](src/request/README.md)
- [开发规范](.codebuddy/.rules/)

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [Taro 官方文档](https://taro-docs.jd.com/)
- [Vue 3 官方文档](https://cn.vuejs.org/)
- [TailwindCSS 官方文档](https://tailwindcss.com/)
- [NutUI-Taro 官方文档](https://nutui.jd.com/taro)