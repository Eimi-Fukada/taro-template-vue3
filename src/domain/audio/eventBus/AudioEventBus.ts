// src/domain/audio/eventBus/AudioEventBus.ts

/**
 * 一个为音频系统打造的专业事件总线：
 * - 基于微任务调度（Promise.resolve）
 * - 支持 once / off / removeAll
 * - 使用 Set 结构防重复
 * - 全局唯一实例，不依赖组件树
 * - 事件领域化（Domain Event）
 */

type Listener<T = any> = (payload: T) => void

export class AudioEventBus {
  private events = new Map<string, Set<Listener>>()

  /** 监听事件 */
  on<T = any>(event: string, fn: Listener<T>) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event)!.add(fn)
    return this
  }

  /** 监听一次 */
  once<T = any>(event: string, fn: Listener<T>) {
    const wrapper: Listener<T> = (payload) => {
      this.off(event, wrapper)
      fn(payload)
    }
    this.on(event, wrapper)
    return this
  }

  /** 移除 */
  off(event: string, fn: Listener) {
    this.events.get(event)?.delete(fn)
    return this
  }

  /** 清空 */
  removeAll(event?: string) {
    if (event) this.events.delete(event)
    else this.events.clear()
  }

  /** 派发（使用 microtask） */
  emit<T = any>(event: string, payload?: T) {
    Promise.resolve().then(() => {
      const listeners = this.events.get(event)
      if (!listeners) return

      // ⭐ 关键优化：浅拷贝，避免遍历期间被修改
      const copies = [...listeners]
      copies.forEach((fn) => fn(payload as T))
    })
    return this
  }
}
