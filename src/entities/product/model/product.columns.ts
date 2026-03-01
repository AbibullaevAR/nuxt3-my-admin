import { h } from 'vue'
import { createColumnHelper } from '@tanstack/vue-table'
import type { Product, ProductStatus } from './product.types'
import { PRODUCT_STATUS_CONFIG } from './product.types'
import { formatCurrency } from '@/shared/lib/helpers/currency'

const columnHelper = createColumnHelper<Product>()

export const productColumns = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) => h('input', {
      type: 'checkbox',
      checked: table.getIsAllPageRowsSelected(),
      class: 'rounded border-gray-300 text-primary-600',
      onChange: table.getToggleAllPageRowsSelectedHandler(),
    }),
    cell: ({ row }) => h('input', {
      type: 'checkbox',
      checked: row.getIsSelected(),
      class: 'rounded border-gray-300 text-primary-600',
      onChange: row.getToggleSelectedHandler(),
    }),
    size: 48,
  }),

  columnHelper.display({
    id: 'image',
    header: '',
    cell: ({ row }) => {
      const img = row.original.images[0]
      return img
        ? h('img', {
          src: img.url,
          alt: img.alt ?? row.original.name,
          class: 'w-10 h-10 rounded-lg object-cover bg-gray-100',
        })
        : h('div', { class: 'w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center' },
          h(resolveComponent('Icon'), { name: 'ph:image', size: '18', class: 'text-gray-400' }),
        )
    },
    size: 64,
  }),

  columnHelper.accessor('name', {
    header: 'Товар',
    cell: ({ getValue, row }) => h('div', { class: 'flex flex-col' }, [
      h('span', { class: 'text-sm font-medium text-gray-900 dark:text-gray-100' }, getValue()),
      h('span', { class: 'text-xs text-gray-500 font-mono' }, row.original.sku),
    ]),
    enableSorting: true,
    size: 260,
  }),

  columnHelper.accessor('status', {
    header: 'Статус',
    cell: ({ getValue }) => {
      const status = getValue() as ProductStatus
      const config = PRODUCT_STATUS_CONFIG[status]
      return h('span', {
        class: 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        style: { color: config.color, backgroundColor: config.bgColor },
      }, config.label)
    },
    enableColumnFilter: true,
    size: 130,
  }),

  columnHelper.accessor('price', {
    header: 'Цена',
    cell: ({ getValue, row }) => h('div', { class: 'flex flex-col items-end' }, [
      h('span', { class: 'text-sm font-semibold text-gray-900 dark:text-gray-100' }, formatCurrency(getValue())),
      row.original.compareAtPrice
        ? h('span', { class: 'text-xs text-gray-400 line-through' }, formatCurrency(row.original.compareAtPrice))
        : null,
    ]),
    enableSorting: true,
    size: 120,
  }),

  columnHelper.accessor('stock', {
    header: 'Остаток',
    cell: ({ getValue, row }) => {
      const stock = getValue()
      const isLow = stock > 0 && stock <= row.original.lowStockThreshold
      const isEmpty = stock === 0
      return h('span', {
        class: [
          'text-sm font-medium tabular-nums',
          isEmpty ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-gray-700 dark:text-gray-300',
        ],
      }, `${stock} шт.`)
    },
    enableSorting: true,
    size: 100,
  }),

  columnHelper.accessor('categoryName', {
    header: 'Категория',
    cell: ({ getValue }) => h('span', {
      class: 'text-sm text-gray-600 dark:text-gray-400',
    }, getValue() ?? '—'),
    size: 140,
  }),

  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-1' }, [
      h('button', {
        class: 'p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
        title: 'Редактировать',
        onClick: () => navigateTo(`/products/${row.original.id}`),
      }, h(resolveComponent('Icon'), { name: 'ph:pencil-simple', size: '16' })),
    ]),
    size: 60,
  }),
]

export const productExportColumns = [
  { key: 'sku', header: 'Артикул' },
  { key: 'name', header: 'Название' },
  { key: 'categoryName', header: 'Категория' },
  { key: 'status', header: 'Статус', transform: (v: ProductStatus) => PRODUCT_STATUS_CONFIG[v].label },
  { key: 'price', header: 'Цена (₽)' },
  { key: 'compareAtPrice', header: 'Цена до скидки (₽)' },
  { key: 'costPrice', header: 'Себестоимость (₽)' },
  { key: 'stock', header: 'Остаток (шт.)' },
] as const
