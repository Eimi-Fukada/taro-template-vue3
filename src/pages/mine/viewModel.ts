import { reactive } from 'vue'

export const useViewModel = () => {
  const state = reactive({
    // 你的响应式状态和数据
    count: 0,
  })

  return {
    state,
  }
}
