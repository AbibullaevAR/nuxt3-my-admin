<script setup lang="ts">
interface FilterOption {
  value: string | number | boolean
  label: string
  count?: number
}

interface FilterGroup {
  key: string
  label: string
  type: 'checkbox' | 'radio' | 'range'
  options?: FilterOption[]
  min?: number
  max?: number
}

interface Props {
  groups: FilterGroup[]
  modelValue: Record<string, unknown>
  isOpen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  'apply': []
  'reset': []
}>()

const localFilters = ref({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
  localFilters.value = { ...newVal }
}, { deep: true })

function toggleCheckbox(key: string, value: unknown) {
  const current = (localFilters.value[key] as unknown[]) ?? []
  const idx = current.indexOf(value)
  const updated = idx === -1 ? [...current, value] : current.filter((_, i) => i !== idx)
  localFilters.value = { ...localFilters.value, [key]: updated }
  emit('update:modelValue', { ...localFilters.value })
}

function isChecked(key: string, value: unknown): boolean {
  const current = (localFilters.value[key] as unknown[]) ?? []
  return current.includes(value)
}

function reset() {
  localFilters.value = {}
  emit('update:modelValue', {})
  emit('reset')
}

const hasFilters = computed(() =>
  Object.values(localFilters.value).some((v) =>
    Array.isArray(v) ? v.length > 0 : v !== undefined && v !== null && v !== '',
  ),
)
</script>

<template>
  <div class="card-padded space-y-5">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
        Фильтры
      </h3>
      <button
        v-if="hasFilters"
        class="text-xs text-primary-500 hover:text-primary-600"
        @click="reset"
      >
        Сбросить
      </button>
    </div>

    <div
      v-for="group in groups"
      :key="group.key"
      class="space-y-2"
    >
      <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {{ group.label }}
      </p>

      <div
        v-if="group.type === 'checkbox' && group.options"
        class="space-y-1.5"
      >
        <label
          v-for="option in group.options"
          :key="String(option.value)"
          class="flex items-center gap-2 cursor-pointer group"
        >
          <input
            type="checkbox"
            :checked="isChecked(group.key, option.value)"
            class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            @change="toggleCheckbox(group.key, option.value)"
          >
          <span class="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 flex-1">
            {{ option.label }}
          </span>
          <span
            v-if="option.count !== undefined"
            class="text-xs text-gray-400 tabular-nums"
          >
            {{ option.count }}
          </span>
        </label>
      </div>
    </div>
  </div>
</template>
