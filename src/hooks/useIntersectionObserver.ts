import { ref, onMounted, onUnmounted } from 'vue'
import Taro from '@tarojs/taro'

/**
 * 利用类型推断获取 observe 回调参数的 entry 类型（使用官方类型定义）。
 * 这样能尽量用 Taro 的官方类型，而不手动声明 entry 接口。
 */
type ObserveCallbackFn = Parameters<Taro.IntersectionObserver['observe']>[1]
type ObserveEntry = ObserveCallbackFn extends (entry: infer E) => void ? E : any

export type UseObserverOptions = {
  /**
   * 如果希望相对于视口请设置为 'viewport'（默认）
   * 如果希望相对于某个滚动容器或元素，传入选择器，例如 '.scroll-view' 或 '#scrollWrap'
   */
  relativeTo?: 'viewport' | string
  /**
   * 传给 relativeToViewport 或 relativeTo 的 margins 对象（top/bottom/left/right 数字）
   * 例如：{ top: 10 }
   */
  margins?: { top?: number; bottom?: number; left?: number; right?: number }
  /**
   * 是否组件挂载后自动开始监听（默认 true）
   */
  autoStart?: boolean
}

/**
 * 通用 Taro IntersectionObserver Hook
 *
 * @param selector 要监听的目标选择器（例如 '#target_image2'）
 * @param onChange 回调，接收 entry（官方类型推断）与 visible(boolean)
 * @param opts 可选项：relativeTo('viewport' | selector), margins, autoStart
 *
 * 注意：
 * - Taro 的 observe 本身返回 void（不是 observer），因此不要把 observe 的返回值赋给 observer。
 * - 必须在页面内（有 page 实例）调用 start，否则会 no-op 并给出 warning/error。
 */
export function useTaroIntersectionObserver(
  selector: string,
  onChange: (entry: ObserveEntry, visible: boolean) => void,
  opts: UseObserverOptions = {}
) {
  const isObserving = ref(false)
  const lastEntry = ref<ObserveEntry | null>(null)
  const error = ref<Error | string | null>(null)

  let observer: Taro.IntersectionObserver | null = null

  const start = () => {
    if (isObserving.value) return
    const page = Taro.getCurrentInstance()?.page
    if (!page) {
      const msg = '[useTaroIntersectionObserver] 未找到 page 实例，start 被跳过'
      console.warn(msg)
      error.value = msg
      return
    }

    try {
      // 创建 observer（不要把 observe 的返回值赋给 observer）
      observer = Taro.createIntersectionObserver(page)

      // 选择相对视口或相对某个容器/元素
      if (opts.relativeTo && opts.relativeTo !== 'viewport') {
        observer = observer.relativeTo(opts.relativeTo, opts.margins || {})
      } else {
        observer = observer.relativeToViewport(opts.margins || {})
      }

      // observe 返回 void —— 回调内处理 entry
      observer.observe(selector, (res: any) => {
        try {
          const visible = !!res.intersectionRatio && res.intersectionRatio > 0
          lastEntry.value = res as ObserveEntry
          onChange(res as ObserveEntry, visible)
        } catch (cbErr) {
          // 防止回调内错误影响 observer
          console.error('[useTaroIntersectionObserver] 回调执行错误：', cbErr)
        }
      })

      isObserving.value = true
      error.value = null
    } catch (e) {
      error.value = e as Error
      console.error(
        '[useTaroIntersectionObserver] 创建/启动 observer 失败：',
        e
      )
      // 清理
      try {
        observer?.disconnect()
      } finally {
        observer = null
        isObserving.value = false
      }
    }
  }

  const stop = () => {
    try {
      observer?.disconnect()
    } catch (e) {
      console.warn('[useTaroIntersectionObserver] disconnect 时出错：', e)
    } finally {
      observer = null
      isObserving.value = false
    }
  }

  // 如果用户希望自动启动：在组件挂载后再启动（page 实例更可靠）
  if (opts.autoStart ?? true) {
    onMounted(() => {
      // small delay 可以减少在某些平台的 race condition（可选）
      // setTimeout(start, 0)
      start()
    })
  }

  // 组件卸载时自动停止，防止内存泄漏
  onUnmounted(() => {
    stop()
  })

  return {
    // 状态
    isObserving,
    lastEntry,
    error,
    // 控制方法
    start,
    stop,
  }
}
