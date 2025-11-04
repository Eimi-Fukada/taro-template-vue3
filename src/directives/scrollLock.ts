import { AppDirective } from './types'

/**
 * 滚动锁定指令（解决小程序动穿透：弹出层滑动时底层页面跟随滚动;iOS 兼容性：部分机型 overflow: hidden 不生效）
 * @example
 * <!-- 弹出层锁定背景滚动 -->
 * <view v-scroll-lock="isPopupVisible">
 *   弹出层内容
 * </view>
 *
 * <!-- 强制锁定（默认） -->
 * <view v-scroll-lock>内容</view>
 */
export const vScrollLock: AppDirective<boolean> = {
  mounted(_el, binding) {
    const shouldLock = binding.value !== false
    if (shouldLock) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed' // 修复 iOS 问题
    }
  },
  unmounted() {
    document.body.style.overflow = ''
    document.body.style.position = ''
  },
}
