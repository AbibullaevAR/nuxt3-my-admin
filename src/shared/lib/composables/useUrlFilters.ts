import { ref, watch, computed, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

type FilterType = 'string' | 'number' | 'boolean' | 'array'

interface FilterConfig {
  type: FilterType
  default: unknown
  debounce?: number
}

type FilterValue<T extends FilterType> =
  T extends 'string' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean :
  T extends 'array' ? string[] :
  never

export function useUrlFilters<T extends Record<string, FilterConfig>>(config: T) {
  const route = useRoute()
  const router = useRouter()

  type FiltersResult = {
    [K in keyof T]: Ref<FilterValue<T[K]['type']>>
  }

  const filters = {} as FiltersResult
  const debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {}

  for (const [key, cfg] of Object.entries(config) as [keyof T & string, FilterConfig][]) {
    const urlValue = route.query[key]
    const initialValue = urlValue !== undefined
      ? parseQueryValue(urlValue as string | string[], cfg.type)
      : cfg.default

    ;(filters as any)[key] = ref(initialValue)
  }

  for (const [key, cfg] of Object.entries(config) as [keyof T & string, FilterConfig][]) {
    watch(
      () => (filters as any)[key].value,
      (newValue) => {
        if (cfg.debounce) {
          clearTimeout(debounceTimers[key])
          debounceTimers[key] = setTimeout(() => {
            syncToUrl(key, newValue, cfg)
          }, cfg.debounce)
        } else {
          syncToUrl(key, newValue, cfg)
        }
      },
    )
  }

  watch(
    () => route.query,
    (query) => {
      for (const [key, cfg] of Object.entries(config) as [keyof T & string, FilterConfig][]) {
        const urlValue = query[key]
        const newValue = urlValue !== undefined
          ? parseQueryValue(urlValue as string | string[], cfg.type)
          : cfg.default

        const currentRef = (filters as any)[key] as Ref
        if (JSON.stringify(currentRef.value) !== JSON.stringify(newValue)) {
          currentRef.value = newValue
        }
      }
    },
  )

  function syncToUrl(key: string, value: unknown, cfg: FilterConfig): void {
    const query = { ...route.query }

    if (JSON.stringify(value) === JSON.stringify(cfg.default)) {
      delete query[key]
    } else {
      query[key] = serializeQueryValue(value, cfg.type) as any
    }

    router.replace({ query })
  }

  function resetAll(): void {
    for (const [key, cfg] of Object.entries(config) as [keyof T & string, FilterConfig][]) {
      ;(filters as any)[key].value = cfg.default
    }
    router.replace({ query: {} })
  }

  const hasActiveFilters = computed(() =>
    Object.entries(config).some(([key, cfg]) => {
      const current = (filters as any)[key].value
      return JSON.stringify(current) !== JSON.stringify(cfg.default)
    }),
  )

  return {
    ...filters,
    resetAll,
    hasActiveFilters,
  }
}

function parseQueryValue(raw: string | string[], type: FilterType): unknown {
  const value = Array.isArray(raw) ? raw[0] : raw

  switch (type) {
    case 'string':
      return value ?? ''
    case 'number':
      return value ? Number(value) : 0
    case 'boolean':
      return value === 'true'
    case 'array':
      return value ? value.split(',').filter(Boolean) : []
    default:
      return value
  }
}

function serializeQueryValue(value: unknown, type: FilterType): string {
  switch (type) {
    case 'array':
      return (value as string[]).join(',')
    default:
      return String(value)
  }
}
