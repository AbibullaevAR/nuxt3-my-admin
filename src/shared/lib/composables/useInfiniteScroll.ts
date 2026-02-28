import { ref, onMounted, onUnmounted, type Ref } from 'vue'

interface UseInfiniteScrollOptions {
  rootMargin?: string
  threshold?: number
  disabled?: Ref<boolean>
}

export function useInfiniteScroll(
  onLoadMore: () => Promise<void> | void,
  options: UseInfiniteScrollOptions = {},
) {
  const { rootMargin = '0px 0px 200px 0px', threshold = 0.1, disabled } = options

  const sentinel = ref<HTMLElement | null>(null)
  const isLoading = ref(false)

  let observer: IntersectionObserver | null = null

  async function handleIntersect(entries: IntersectionObserverEntry[]) {
    const entry = entries[0]
    if (!entry.isIntersecting) return
    if (disabled?.value) return
    if (isLoading.value) return

    isLoading.value = true
    try {
      await onLoadMore()
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    observer = new IntersectionObserver(handleIntersect, {
      rootMargin,
      threshold,
    })

    if (sentinel.value) {
      observer.observe(sentinel.value)
    }
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return {
    sentinel,
    isLoading,
  }
}
