import { ref, computed, watch, type Ref } from 'vue'
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  type PaginationState,
  type VisibilityState,
  type TableOptions,
} from '@tanstack/vue-table'

interface UseDataTableOptions<TData> {
  columns: ColumnDef<TData, any>[]
  data: Ref<TData[]>
  pageSize?: number
  enableRowSelection?: boolean
  enableMultiSort?: boolean
  manualPagination?: boolean
  manualSorting?: boolean
  pageCount?: Ref<number>
  onSortingChange?: (sorting: SortingState) => void
  onPaginationChange?: (pagination: PaginationState) => void
}

export function useDataTable<TData>(options: UseDataTableOptions<TData>) {
  const {
    columns,
    data,
    pageSize = 20,
    enableRowSelection = false,
    enableMultiSort = false,
    manualPagination = false,
    manualSorting = false,
    pageCount,
    onSortingChange,
    onPaginationChange,
  } = options

  const sorting = ref<SortingState>([])
  const columnFilters = ref<ColumnFiltersState>([])
  const rowSelection = ref<RowSelectionState>({})
  const columnVisibility = ref<VisibilityState>({})
  const globalFilter = ref('')
  const pagination = ref<PaginationState>({
    pageIndex: 0,
    pageSize,
  })

  watch(sorting, (newSorting) => {
    onSortingChange?.(newSorting)
  }, { deep: true })

  watch(pagination, (newPagination) => {
    onPaginationChange?.(newPagination)
  }, { deep: true })

  const tableOptions = computed<TableOptions<TData>>(() => ({
    data: data.value,
    columns,
    state: {
      sorting: sorting.value,
      columnFilters: columnFilters.value,
      rowSelection: rowSelection.value,
      columnVisibility: columnVisibility.value,
      globalFilter: globalFilter.value,
      pagination: pagination.value,
    },

    onSortingChange: (updater) => {
      sorting.value = typeof updater === 'function'
        ? updater(sorting.value)
        : updater
    },
    onColumnFiltersChange: (updater) => {
      columnFilters.value = typeof updater === 'function'
        ? updater(columnFilters.value)
        : updater
    },
    onRowSelectionChange: (updater) => {
      rowSelection.value = typeof updater === 'function'
        ? updater(rowSelection.value)
        : updater
    },
    onColumnVisibilityChange: (updater) => {
      columnVisibility.value = typeof updater === 'function'
        ? updater(columnVisibility.value)
        : updater
    },
    onPaginationChange: (updater) => {
      pagination.value = typeof updater === 'function'
        ? updater(pagination.value)
        : updater
    },
    onGlobalFilterChange: (updater) => {
      globalFilter.value = typeof updater === 'function'
        ? updater(globalFilter.value)
        : updater
    },

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: manualPagination ? undefined : getPaginationRowModel(),

    enableRowSelection,
    enableMultiSort,
    manualPagination,
    manualSorting,
    pageCount: pageCount?.value,
  }))

  const table = useVueTable(tableOptions)

  const selectedRows = computed(() =>
    table.getSelectedRowModel().rows.map((row) => row.original),
  )

  const selectedCount = computed(() =>
    Object.keys(rowSelection.value).length,
  )

  const hasSelection = computed(() => selectedCount.value > 0)

  const pageIndex = computed({
    get: () => pagination.value.pageIndex,
    set: (value: number) => {
      pagination.value = { ...pagination.value, pageIndex: value }
    },
  })

  function clearSelection(): void {
    rowSelection.value = {}
  }

  function selectAll(): void {
    const allSelected: RowSelectionState = {}
    data.value.forEach((_, index) => {
      allSelected[index] = true
    })
    rowSelection.value = allSelected
  }

  function setGlobalFilter(value: string): void {
    globalFilter.value = value
  }

  function toggleColumnVisibility(columnId: string): void {
    columnVisibility.value = {
      ...columnVisibility.value,
      [columnId]: !columnVisibility.value[columnId],
    }
  }

  function resetFilters(): void {
    columnFilters.value = []
    globalFilter.value = ''
    sorting.value = []
    pagination.value = { pageIndex: 0, pageSize }
  }

  return {
    table,

    sorting,
    columnFilters,
    rowSelection,
    columnVisibility,
    globalFilter,
    pagination,

    selectedRows,
    selectedCount,
    hasSelection,
    pageIndex,

    clearSelection,
    selectAll,
    setGlobalFilter,
    toggleColumnVisibility,
    resetFilters,
  }
}
