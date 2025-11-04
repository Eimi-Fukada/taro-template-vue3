import { AppDirective } from './types'
import Taro from '@tarojs/taro'

type TrackPayload = string | { id: string; extra?: Record<string, any> }

/**
 * 元素曝光埋点指令（基于 IntersectionObserver）
 * @example
 * <!-- 基础用法 -->
 * <view v-track="'home_banner'">广告位</view>
 *
 * <!-- 带自定义参数 -->
 * <view v-track="{ id: 'banner', extra: { pos: 1 } }">广告位</view>
 */
export const vTrack: AppDirective<TrackPayload> = {
  mounted(el, binding) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const payload =
          typeof binding.value === 'string'
            ? { id: binding.value }
            : binding.value
        Taro.reportAnalytics('element_show', payload)
        observer.unobserve(el)
      }
    })
    observer.observe(el)
  },
}
