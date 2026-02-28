import { ref } from 'vue'

interface OptimisticUpdateOptions<T> {
  optimisticFn: () => void
  apiFn: () => Promise<T>
  rollbackFn: () => void
  onSuccess?: (result: T) => void
  onError?: (err: unknown) => void
}

export function useOptimisticUpdate() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function execute<T>(options: OptimisticUpdateOptions<T>): Promise<T | null> {
    const { optimisticFn, apiFn, rollbackFn, onSuccess, onError } = options

    isLoading.value = true
    error.value = null

    optimisticFn()

    try {
      const result = await apiFn()
      onSuccess?.(result)
      return result
    } catch (err) {
      rollbackFn()
      const message = err instanceof Error ? err.message : 'Операция не выполнена'
      error.value = message
      onError?.(err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    execute,
    isLoading,
    error,
  }
}
