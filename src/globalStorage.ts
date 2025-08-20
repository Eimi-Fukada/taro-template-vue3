import Taro from '@tarojs/taro'
/**
 * 不管是redux还是全局上下文都解决不了H5刷新页面数据丢失的问题，最好的方法是用sessionStorage，或者是localStorage，
 * 需要根据情形使用，判断关闭窗口后下次打开时候还需要这部分缓存数据
 * 而小程序则可以直接使用Taro.setStorageSync，同步版本
 */

interface StorageDTO {
  /** nickName */
  nickName: string
  /** mobile */
  mobile: string
  /** password */
  password: string
  /** headImg */
  headImg: string
}

type StorageKey = keyof StorageDTO

export function getItem<K extends StorageKey>(key: K) {
  try {
    const raw = Taro.getStorageSync(key)
    // const raw = window.sessionStorage.getItem(key)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    throw 'JSON parse 失败'
  }
}

export function setItem<K extends StorageKey>(key: K, value: StorageDTO[K]) {
  return Taro.setStorageSync(key, JSON.stringify(value))
  //   return window.sessionStorage.setItem(key, JSON.stringify(value))
}

export function removeItem(key: StorageKey) {
  return Taro.removeStorageSync(key)
  //   return window.sessionStorage.removeItem(key)
}

export function clear() {
  return Taro.clearStorageSync()
  //   return window.sessionStorage.clear()
}
