import { AppDirective } from './types'

/**
 * 安全区域适配指令（兼容 iPhone 刘海屏）
 * @example
 * <!-- 为底部按钮添加安全区域 padding -->
 * <button v-safe-area>底部按钮</button>
 *
 * <!-- 自定义安全区域样式 -->
 * <div v-safe-area="{ bottom: '20px' }">内容</div>
 */
export const vSafeArea: AppDirective<string | { bottom?: string }> = {
  mounted(el, binding) {
    const paddingBottom =
      typeof binding.value === 'string'
        ? binding.value
        : binding.value?.bottom || 'env(safe-area-inset-bottom)'
    el.style.paddingBottom = `calc(${paddingBottom} + 20px)`
  },
}
