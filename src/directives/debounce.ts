import { debounce } from 'es-toolkit'
import { AppDirective } from './types'

/**
 * 防抖指令
 * @example
 * <button v-debounce:click="handleSubmit">提交</button>
 * <input v-debounce.500:input="handleInput" />
 * 不指定事件类型时默认监听 click
 * <div v-debounce="handleClick">点击区域</div>
 */
export const vDebounce: AppDirective<(...args: any[]) => void> = {
  mounted(el, binding) {
    const { arg: eventType = 'click', value: callback } = binding

    if (typeof callback !== 'function') {
      console.warn('[v-debounce] 必须绑定函数')
      return
    }

    // 默认防抖时间 300ms（可通过修饰符指定，如 v-debounce.500）
    const delay = Number(Object.keys(binding.modifiers)[0]) || 300
    const debouncedFn = debounce(callback, delay)
    el.addEventListener(eventType, debouncedFn)

    // 存储函数引用以便卸载时移除，添加防御性分号，避免与前一行代码意外结合导致的语法错误
    ;(el as any)._debouncedFn = debouncedFn
  },

  unmounted(el, binding) {
    const eventType = binding.arg || 'click'
    const debouncedFn = (el as any)._debouncedFn
    if (debouncedFn) {
      el.removeEventListener(eventType, debouncedFn)
    }
  },
}
