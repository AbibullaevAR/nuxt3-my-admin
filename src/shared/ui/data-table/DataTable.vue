<script setup lang="ts" generic="TData">
import { FlexRender, type Table } from '@tanstack/vue-table'
import { vAutoAnimate } from '@formkit/auto-animate'

interface Props {
  table: Table<TData>
  isLoading?: boolean
  emptyText?: string
  emptyIcon?: string
}

withDefaults(defineProps<Props>(), {
  isLoading: false,
  emptyText: 'Данные не найдены',
  emptyIcon: 'ph:database',
})
</script>

<template>
  <div class="overflow-x-auto border border-gray-100 dark:border-[#21293a] rounded-2xl">
    <div
      v-if="isLoading"
      class="relative"
    >
      <div class="absolute inset-0 bg-white/60 dark:bg-[#161b27]/60 z-10 flex items-center justify-center rounded-2xl">
        <Icon
          name="ph:spinner"
          size="32"
          class="animate-spin text-primary-500"
        />
      </div>
    </div>

    <table class="w-full text-left">
      <thead class="bg-gray-50/80 dark:bg-[#1a1f2e]">
        <tr
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id"
        >
          <th
            v-for="header in headerGroup.headers"
            :key="header.id"
            class="px-4 py-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap"
            :style="{ width: header.getSize() !== 150 ? `${header.getSize()}px` : undefined }"
            :class="{ 'cursor-pointer select-none hover:text-gray-600 dark:hover:text-gray-300': header.column.getCanSort() }"
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
          class="border-t border-gray-50 dark:border-[#21293a] hover:bg-gray-50/50 dark:hover:bg-[#1a1f2e]/50 transition-colors"
          :class="{ 'bg-primary-50/30 dark:bg-primary-900/10': row.getIsSelected() }"
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

        <tr v-if="table.getRowModel().rows.length === 0 && !isLoading">
          <td
            :colspan="table.getAllColumns().length"
            class="px-4 py-16 text-center"
          >
            <Icon
              :name="emptyIcon"
              size="48"
              class="mx-auto mb-3 text-gray-300 dark:text-gray-600"
            />
            <p class="text-sm text-gray-400 dark:text-gray-500">
              {{ emptyText }}
            </p>
            <slot name="empty-actions" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
