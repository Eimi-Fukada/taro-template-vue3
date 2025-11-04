import { AppDirective } from './types'

/**
 * 图片加载失败兜底指令
 * @example
 * <!-- 使用默认兜底图 -->
 * <image v-img-fallback src="可能失效的URL" />
 *
 * <!-- 自定义兜底图 -->
 * <image v-img-fallback="/custom-fallback.png" src="可能失效的URL" />
 */
export const vImgFallback: AppDirective<string, HTMLImageElement> = {
  mounted(el, binding) {
    const fallbackUrl =
      binding.value || '/assets/icon-image/images/fallback.png'
    el.addEventListener(
      'error',
      () => {
        el.src = fallbackUrl
      },
      { capture: true }
    ) // 使用捕获模式确保触发
  },
}
