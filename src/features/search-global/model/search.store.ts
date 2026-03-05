import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useFuzzySearch, type SearchableItem } from '@/shared/lib/composables/useFuzzySearch'
import { NAV_ITEMS, ROUTES } from '@/shared/config/constants'

export const useSearchStore = defineStore('search', () => {
  const isOpen = ref(false)

  const staticItems = computed<SearchableItem[]>(() => [
    ...NAV_ITEMS.map((item) => ({
      id: `page-${item.path}`,
      type: 'page' as const,
      title: item.label,
      icon: item.icon,
      url: item.path,
    })),

    {
      id: 'action-create-order',
      type: 'action' as const,
      title: 'Создать заказ',
      icon: 'ph:plus-circle',
      url: ROUTES.ORDER_CREATE,
    },
    {
      id: 'action-create-product',
      type: 'action' as const,
      title: 'Добавить товар',
      icon: 'ph:package-plus',
      url: ROUTES.PRODUCT_CREATE,
    },
    {
      id: 'action-settings',
      type: 'action' as const,
      title: 'Настройки',
      icon: 'ph:gear-six',
      url: ROUTES.SETTINGS,
    },
  ])

  const { query, results, groupedResults, activeIndex, highlightMatches,
    navigateUp, navigateDown, selectResult } = useFuzzySearch(staticItems, {
    limit: 8,
    threshold: 0.4,
    debounce: 150,
  })

  function open() {
    isOpen.value = true
    query.value = ''
  }

  function close() {
    isOpen.value = false
    query.value = ''
  }

  function toggle() {
    isOpen.value ? close() : open()
  }

  return {
    isOpen,
    query,
    results,
    groupedResults,
    activeIndex,
    highlightMatches,
    navigateUp,
    navigateDown,
    selectResult,
    open,
    close,
    toggle,
  }
})
