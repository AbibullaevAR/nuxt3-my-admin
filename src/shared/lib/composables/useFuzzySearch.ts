import { ref, computed, watch, type Ref } from 'vue'
import Fuse, { type FuseResult, type IFuseOptions } from 'fuse.js'

export type SearchableItemType = 'order' | 'product' | 'customer' | 'page' | 'action'

export interface SearchableItem {
  id: string
  type: SearchableItemType
  title: string
  description?: string
  tags?: string[]
  icon?: string
  url?: string
  action?: () => void
}

interface UseFuzzySearchOptions {
  limit?: number
  threshold?: number
  debounce?: number
}

export function useFuzzySearch(
  items: Ref<SearchableItem[]>,
  options: UseFuzzySearchOptions = {},
) {
  const { limit = 10, threshold = 0.3, debounce = 150 } = options

  const query = ref('')
  const activeIndex = ref(0)
  const isOpen = ref(false)

  const fuseOptions: IFuseOptions<SearchableItem> = {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'tags', weight: 0.3 },
      { name: 'description', weight: 0.2 },
      { name: 'id', weight: 0.1 },
    ],
    threshold,
    includeMatches: true,
    includeScore: true,
    minMatchCharLength: 2,
  }

  let fuse: Fuse<SearchableItem>
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  watch(items, (newItems) => {
    fuse = new Fuse(newItems, fuseOptions)
  }, { immediate: true })

  const rawResults = ref<FuseResult<SearchableItem>[]>([])

  watch(query, (newQuery) => {
    if (debounceTimer) clearTimeout(debounceTimer)

    if (!newQuery.trim()) {
      rawResults.value = []
      activeIndex.value = 0
      return
    }

    debounceTimer = setTimeout(() => {
      rawResults.value = fuse.search(newQuery, { limit })
      activeIndex.value = 0
    }, debounce)
  })

  const results = computed(() =>
    rawResults.value.map((result) => ({
      item: result.item,
      score: result.score ?? 1,
      matches: result.matches?.map((match) => ({
        key: match.key ?? '',
        indices: match.indices as [number, number][],
        value: match.value ?? '',
      })) ?? [],
    })),
  )

  const groupedResults = computed(() => {
    const groups = new Map<SearchableItemType, typeof results.value>()

    const typeOrder: SearchableItemType[] = ['action', 'page', 'order', 'product', 'customer']

    for (const result of results.value) {
      const type = result.item.type
      if (!groups.has(type)) groups.set(type, [])
      groups.get(type)!.push(result)
    }

    return typeOrder
      .filter((type) => groups.has(type))
      .map((type) => ({
        type,
        label: TYPE_LABELS[type],
        icon: TYPE_ICONS[type],
        results: groups.get(type)!,
      }))
  })

  function highlightMatches(text: string, indices: [number, number][]): string {
    if (!indices || indices.length === 0) return escapeHtml(text)

    let result = ''
    let lastIndex = 0

    const sorted = [...indices].sort((a, b) => a[0] - b[0])

    for (const [start, end] of sorted) {
      result += escapeHtml(text.slice(lastIndex, start))
      result += `<mark class="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded px-0.5">`
      result += escapeHtml(text.slice(start, end + 1))
      result += '</mark>'
      lastIndex = end + 1
    }

    result += escapeHtml(text.slice(lastIndex))
    return result
  }

  function navigateUp(): void {
    activeIndex.value = Math.max(0, activeIndex.value - 1)
  }

  function navigateDown(): void {
    const maxIndex = results.value.length - 1
    activeIndex.value = Math.min(maxIndex, activeIndex.value + 1)
  }

  function selectResult(index?: number): void {
    const i = index ?? activeIndex.value
    const result = results.value[i]

    if (!result) return

    if (result.item.action) {
      result.item.action()
    } else if (result.item.url) {
      navigateTo(result.item.url)
    }

    close()
  }

  function open(): void {
    isOpen.value = true
    query.value = ''
    rawResults.value = []
    activeIndex.value = 0
  }

  function close(): void {
    isOpen.value = false
    query.value = ''
  }

  function toggle(): void {
    isOpen.value ? close() : open()
  }

  return {
    query,
    results,
    groupedResults,
    activeIndex,
    isOpen,

    highlightMatches,
    navigateUp,
    navigateDown,
    selectResult,
    open,
    close,
    toggle,
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

const TYPE_LABELS: Record<SearchableItemType, string> = {
  order: 'Заказы',
  product: 'Товары',
  customer: 'Клиенты',
  page: 'Страницы',
  action: 'Действия',
}

const TYPE_ICONS: Record<SearchableItemType, string> = {
  order: 'ph:shopping-bag',
  product: 'ph:package',
  customer: 'ph:users',
  page: 'ph:browser',
  action: 'ph:lightning',
}
