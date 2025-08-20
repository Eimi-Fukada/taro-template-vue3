import Taro, { nextTick } from '@tarojs/taro'

/**
 * 模拟异步
 */
export function sleep(time = 1000) {
  return new Promise<void>((resolve, _reject) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

/**
 * 查询元素大小
 *
 * @export
 * @param {string} name
 * @param {*} scope
 * @returns
 */
export function selectRect(name: string) {
  return new Promise<Taro.NodesRef.BoundingClientRectCallbackResult>(
    (resolve, _reject) => {
      nextTick(() => {
        const query = Taro.createSelectorQuery()
        query
          .select(name)
          .boundingClientRect((res) => {
            resolve(res as Taro.NodesRef.BoundingClientRectCallbackResult)
          })
          .exec()
      })
    }
  )
}
