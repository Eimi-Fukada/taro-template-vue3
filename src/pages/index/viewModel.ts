import { reactive, onMounted } from 'vue'

export const useViewModel = () => {
  const state = reactive({
    // 你的响应式状态和数据
    count: 0,
  })

  const increment = () => {
    state.count++
  }

  // you can write your mounted function
  onMounted(() => {})

  return {
    state,
    increment,
  }
}
