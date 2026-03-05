<script setup lang="ts">
import { useExport } from '@/shared/lib/composables/useExport'

interface ExportColumn {
  key: string
  header: string
  transform?: (value: any, row: any) => string | number
}

interface Props {
  data: unknown[]
  columns: readonly ExportColumn[]
  filename: string
  title?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
})

const { exportCSV, exportXLSX, exportPDF, isExporting } = useExport()
const isMenuOpen = ref(false)

async function handleExport(format: 'csv' | 'xlsx' | 'pdf') {
  isMenuOpen.value = false
  const opts = {
    filename: props.filename,
    data: props.data as any[],
    columns: props.columns,
  }

  if (format === 'csv') await exportCSV(opts)
  if (format === 'xlsx') await exportXLSX({ filename: props.filename, sheets: [{ name: 'Данные', ...opts }] })
  if (format === 'pdf') await exportPDF({ ...opts, title: props.title })
}
</script>

<template>
  <div class="relative">
    <button
      class="btn-secondary flex items-center gap-1.5"
      :disabled="isExporting || disabled"
      @click="isMenuOpen = !isMenuOpen"
    >
      <Icon
        v-if="isExporting"
        name="ph:spinner"
        size="16"
        class="animate-spin"
      />
      <Icon
        v-else
        name="ph:download-simple"
        size="16"
      />
      Экспорт
      <Icon
        name="ph:caret-down"
        size="14"
        class="text-gray-400"
      />
    </button>

    <Transition
      enter-active-class="transition-all duration-150"
      enter-from-class="opacity-0 translate-y-1 scale-95"
      leave-active-class="transition-all duration-150"
      leave-to-class="opacity-0 translate-y-1 scale-95"
    >
      <div
        v-if="isMenuOpen"
        v-click-outside="() => (isMenuOpen = false)"
        class="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-20"
      >
        <button
          v-for="format in (['csv', 'xlsx', 'pdf'] as const)"
          :key="format"
          class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          @click="handleExport(format)"
        >
          <Icon
            :name="{ csv: 'ph:file-csv', xlsx: 'ph:file-xls', pdf: 'ph:file-pdf' }[format]"
            size="16"
            class="text-gray-400"
          />
          {{ format.toUpperCase() }}
        </button>
      </div>
    </Transition>
  </div>
</template>
