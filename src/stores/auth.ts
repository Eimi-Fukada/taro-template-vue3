// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const retryQueue = ref<Array<() => Promise<void>>>([])

  const addToRetryQueue = (request: () => Promise<void>) => {
    retryQueue.value.push(request)
  }

  const retryAll = () => {
    retryQueue.value.forEach((request) => request())
    retryQueue.value = []
  }

  return { addToRetryQueue, retryAll }
})
