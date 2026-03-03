<script setup lang="ts">
import { computed } from 'vue'
import { FlexRender } from '@tanstack/vue-table'
import { vAutoAnimate } from '@formkit/auto-animate'
import { useDataTable } from '@/shared/lib/composables/useDataTable'
import { useExport } from '@/shared/lib/composables/useExport'
import { orderColumns, orderExportColumns } from '@/entities/order/model/order.columns'
import { useOrderStore } from '@/entities/order/model/order.store'
import type { OrderStatus } from '@/entities/order/model/order.types'
import { ORDER_STATUS_CONFIG } from '@/entities/order/model/order.types'

const orderStore = useOrderStore()

const {
  table,
  sorting,
  rowSelection,
  selectedRows,
  selectedCount,
  hasSelection,
  globalFilter,
  pagination,
  clearSelection,
  setGlobalFilter,
  resetFilters,
} = useDataTable({
  columns: orderColumns,
  data: computed(() => orderStore.orders),
  pageSize: 20,
  enableRowSelection: true,
  manualPagination: true,
  manualSorting: true,
  pageCount: computed(() => orderStore.totalPages),
  onPaginationChange: (p) => {
    orderStore.fetchOrders({ page: p.pageIndex + 1, limit: p.pageSize })
  },
  onSortingChange: (s) => {
    if (s.length > 0) {
      orderStore.fetchOrders({
        sortBy: s[0].id as any,
        sortOrder: s[0].desc ? 'desc' : 'asc',
      })
    }
  },
})

const { exportCSV, exportXLSX, exportPDF, isExporting } = useExport()

async function handleExport(format: 'csv' | 'xlsx' | 'pdf') {
  const data = hasSelection.value ? selectedRows.value : orderStore.orders
  const filename = `orders-${new Date().toISOString().split('T')[0]}`

  switch (format) {
    case 'csv':
      await exportCSV({ filename, data, columns: orderExportColumns })
      break
    case 'xlsx':
      await exportXLSX({ filename, sheets: [{ name: 'Заказы', data, columns: orderExportColumns }] })
      break
    case 'pdf':
      await exportPDF({ filename, data, columns: orderExportColumns, title: 'Отчёт по заказам' })
      break
  }
}

async function handleBulkStatusChange(status: OrderStatus) {
  const ids = selectedRows.value.map((o) => o.id)
  await orderStore.bulkUpdateStatus(ids, status)
  clearSelection()
}

const statusFilter = ref<OrderStatus[]>([])
watch(statusFilter, (statuses) => {
  orderStore.fetchOrders({ status: statuses.length > 0 ? statuses : undefined, page: 1 })
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="relative flex-1 max-w-sm">
        <Icon
          name="ph:magnifying-glass"
          size="18"
          class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          :value="globalFilter"
          type="search"
          placeholder="Поиск заказов..."
          class="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          @input="setGlobalFilter(($event.target as HTMLInputElement).value)"
        >
      </div>

      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1">
          <button
            v-for="(config, status) in ORDER_STATUS_CONFIG"
            :key="status"
            class="px-2 py-1 text-xs rounded-full border transition-all"
            :class="statusFilter.includes(status as OrderStatus)
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300'"
            @click="
              statusFilter.includes(status as OrderStatus)
                ? statusFilter = statusFilter.filter(s => s !== status)
                : statusFilter = [...statusFilter, status as OrderStatus]
            "
          >
            {{ config.label }}
          </button>
        </div>

        <div class="relative">
          <button
            class="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            :disabled="isExporting"
          >
            <Icon name="ph:download-simple" size="16" />
            Экспорт
          </button>
        </div>
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      leave-active-class="transition-all duration-200"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="hasSelection"
        class="flex items-center gap-3 px-4 py-2.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg"
      >
        <span class="text-sm font-medium text-primary-700 dark:text-primary-300">
          Выбрано: {{ selectedCount }}
        </span>

        <div class="flex items-center gap-2 ml-auto">
          <button
            class="px-3 py-1 text-xs font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            @click="handleBulkStatusChange('confirmed')"
          >
            Подтвердить
          </button>
          <button
            class="px-3 py-1 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            @click="handleBulkStatusChange('cancelled')"
          >
            Отменить
          </button>
          <button
            class="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 transition-colors"
            @click="clearSelection"
          >
            Сбросить
          </button>
        </div>
      </div>
    </Transition>

    <div class="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl">
      <table class="w-full text-left">
        <thead class="bg-gray-50 dark:bg-gray-900">
          <tr
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
          >
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              :style="{ width: `${header.getSize()}px` }"
              :class="{ 'cursor-pointer select-none hover:text-gray-700': header.column.getCanSort() }"
              @click="header.column.getToggleSortingHandler()?.($event)"
            >
              <div class="flex items-center gap-1.5">
                <FlexRender
                  v-if="!header.isPlaceholder"
                  :render="header.column.columnDef.header"
                  :props="header.getContext()"
                />
                <Icon
                  v-if="header.column.getIsSorted() === 'asc'"
                  name="ph:sort-ascending"
                  size="14"
                  class="text-primary-500"
                />
                <Icon
                  v-else-if="header.column.getIsSorted() === 'desc'"
                  name="ph:sort-descending"
                  size="14"
                  class="text-primary-500"
                />
              </div>
            </th>
          </tr>
        </thead>

        <tbody v-auto-animate>
          <tr
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            :class="{ 'bg-primary-50/50 dark:bg-primary-900/10': row.getIsSelected() }"
          >
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="px-4 py-3"
            >
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()"
              />
            </td>
          </tr>

          <tr v-if="table.getRowModel().rows.length === 0">
            <td
              :colspan="table.getAllColumns().length"
              class="px-4 py-12 text-center text-gray-400"
            >
              <Icon name="ph:shopping-bag" size="48" class="mx-auto mb-3 opacity-30" />
              <p class="text-sm">Заказы не найдены</p>
              <button
                class="mt-2 text-sm text-primary-500 hover:text-primary-600"
                @click="resetFilters"
              >
                Сбросить фильтры
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-500">
        Показано {{ table.getRowModel().rows.length }} из {{ orderStore.total }} заказов
      </p>

      <div class="flex items-center gap-2">
        <button
          class="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          Назад
        </button>

        <span class="text-sm text-gray-600 dark:text-gray-400 px-2">
          {{ pagination.pageIndex + 1 }} / {{ orderStore.totalPages || 1 }}
        </span>

        <button
          class="px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          Далее
        </button>
      </div>
    </div>
  </div>
</template>
