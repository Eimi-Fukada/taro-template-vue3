import { reactive } from 'vue'

export const useViewModel = () => {
  const state = reactive({
    // 你的响应式状态和数据
    count: 0,
  })

  const handleNavigateToMiniProgram = () => {
    Taro.navigateToMiniProgram({
      appId: '',
      path: '',
      extraData: {},
      envVersion: 'release',
      fail(res) {
        // Taro.showToast({ title: res.errMsg || '跳转失败', icon: 'none' })
        console.log('fail===', res)
      },
    })
  }

  return {
    state,
    handleNavigateToMiniProgram,
  }
}
