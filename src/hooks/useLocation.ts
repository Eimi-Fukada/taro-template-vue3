import Taro from '@tarojs/taro'
import { ref } from 'vue'

interface LocationResult {
  latitude: number
  longitude: number
  district: string
  error?: string
}

/**
 * 获取用户位置的 Hook
 * @param isHighAccuracy 是否使用高精度定位（默认 false）
 * @returns 返回位置信息和错误信息
 */
export const useLocation = (isHighAccuracy: boolean = false) => {
  const location = ref<LocationResult | null>(null)
  const error = ref<string | null>(null)

  const getLocation = async () => {
    await Taro.getLocation({
      type: 'wgs84', // 返回 GPS 坐标
      isHighAccuracy, // 是否高精度定位
      success: function (res) {
        const latitude = res.latitude
        const longitude = res.longitude
        console.log('res', latitude, longitude)
        location.value = {
          latitude: res.latitude,
          longitude: res.longitude,
          district: res.district || '高新区',
        }
        error.value = null
      },
      fail: function (err) {
        error.value = err.errMsg || '获取位置失败'
        location.value = null
      },
    })
  }

  return {
    location,
    error,
    getLocation,
  }
}
