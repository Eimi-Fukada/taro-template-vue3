import { Ref, ref } from 'vue'

/**
 * 超级锁钩子。未运行完毕锁。n毫秒运行一次锁。运行成功n毫秒后才能运行锁。
 *
 * @param fun 需要加锁的异步函数
 * @param delay 锁定延迟时间（毫秒）
 */
export function useSuperLock<R, Args extends unknown[]>(
  fun: (...args: Args) => Promise<R>,
  delay = 100
): [(...args: Args) => Promise<R | void>, Ref<boolean>] {
  const lock = ref(false)
  const lastDate = ref<Date | undefined>(undefined)

  // 创建一个包装函数
  const wrappedFunction = async function (
    this: unknown,
    ...args: Args
  ): Promise<R | void> {
    if (lock.value) {
      return
    }

    const nowDate = new Date()
    if (
      lastDate.value &&
      nowDate.getTime() - lastDate.value.getTime() <= delay
    ) {
      return
    }

    lastDate.value = nowDate
    lock.value = true

    try {
      // 使用调用时的 this 上下文
      return await fun.apply(this, args)
    } finally {
      setTimeout(() => {
        lock.value = false
      }, delay)
    }
  }

  return [wrappedFunction, lock]
}
