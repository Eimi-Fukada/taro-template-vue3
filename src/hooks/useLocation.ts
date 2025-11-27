import Taro from '@tarojs/taro'
import { ref } from 'vue'

interface LocationResult {
  latitude?: number
  longitude?: number
  district: string
  error?: string
}

/**
 * 获取用户位置的 Hook
 * @param isHighAccuracy 是否使用高精度定位（默认 false）
 * @returns 返回位置信息和错误信息
 */
export const useLocation = (isHighAccuracy: boolean = false) => {
  const location = ref<LocationResult | null>({ district: '未获取定位' })
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
          district: '苏州市',
        }
        error.value = null
      },
      fail: function (err) {
        error.value = err.errMsg || '获取位置失败'
        location.value = { district: '未获取定位' }
        // 检查是否是用户拒绝授权
        if (
          err.errMsg?.includes('auth deny') ||
          err.errMsg?.includes('用户拒绝授权')
        ) {
          // 必须要手动触发操作，让用户自己打开设置
          Taro.showModal({
            title: '位置权限',
            content:
              '需要获取您的位置信息来提供更好的服务，请在设置中允许位置授权',
            confirmText: '去设置',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                // 打开小程序设置页面
                Taro.openSetting({
                  success: (settingRes) => {
                    if (settingRes.authSetting['scope.userLocation']) {
                      // 用户重新授权后再次获取位置
                      getLocation()
                    }
                  },
                  fail: (err) => {
                    console.log('openSetting fail', err)
                  },
                })
              }
            },
          })
        }
      },
    })
  }

  return {
    location,
    error,
    getLocation,
  }
}
