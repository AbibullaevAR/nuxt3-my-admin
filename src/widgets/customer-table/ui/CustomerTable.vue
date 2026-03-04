<script setup lang="ts">
import { computed } from 'vue'
import DataTable from '@/shared/ui/data-table/DataTable.vue'
import ExportButton from '@/features/export-data/ui/ExportButton.vue'
import { useDataTable } from '@/shared/lib/composables/useDataTable'
import { customerColumns, customerExportColumns } from '@/entities/customer/model/customer.columns'
import { useCustomerStore } from '@/entities/customer/model/customer.store'

const customerStore = useCustomerStore()

const { table, globalFilter, setGlobalFilter, pagination } = useDataTable({
  columns: customerColumns,
  data: computed(() => customerStore.customers),
  pageSize: 20,
  manualPagination: true,
  manualSorting: true,
  pageCount: computed(() => customerStore.totalPages),
  onPaginationChange: (p) => {
    customerStore.fetchCustomers({ page: p.pageIndex + 1, limit: p.pageSize })
  },
})

onMounted(() => customerStore.fetchCustomers())
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
          placeholder="Поиск клиентов..."
          class="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          @input="setGlobalFilter(($event.target as HTMLInputElement).value)"
        >
      </div>

      <ExportButton
        :data="customerStore.customers"
        :columns="customerExportColumns"
        :filename="`customers-${new Date().toISOString().split('T')[0]}`"
        title="Клиенты"
      />
    </div>

    <DataTable
      :table="table"
      :is-loading="customerStore.isLoading"
      empty-text="Клиенты не найдены"
      empty-icon="ph:users"
    />

    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-500">
        Показано {{ customerStore.customers.length }} из {{ customerStore.total }} клиентов
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
          {{ pagination.pageIndex + 1 }} / {{ customerStore.totalPages || 1 }}
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
