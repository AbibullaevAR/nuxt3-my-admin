import { h } from 'vue'
import { createColumnHelper } from '@tanstack/vue-table'
import type { Customer, CustomerSegment } from './customer.types'
import { CUSTOMER_SEGMENT_CONFIG } from './customer.types'
import { formatCurrency } from '@/shared/lib/helpers/currency'
import { formatRelativeDate } from '@/shared/lib/helpers/date'

const columnHelper = createColumnHelper<Customer>()

export const customerColumns = [
  columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
    id: 'fullName',
    header: 'Клиент',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
      h('div', {
        class: 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white shrink-0',
        style: { backgroundColor: CUSTOMER_SEGMENT_CONFIG[row.original.segment].color },
      }, row.original.firstName.charAt(0).toUpperCase()),
      h('div', { class: 'flex flex-col' }, [
        h('span', { class: 'text-sm font-medium text-gray-900 dark:text-gray-100' },
          `${row.original.firstName} ${row.original.lastName}`),
        h('span', { class: 'text-xs text-gray-500' }, row.original.email),
      ]),
    ]),
    enableSorting: true,
    size: 240,
  }),

  columnHelper.accessor('segment', {
    header: 'Сегмент',
    cell: ({ getValue }) => {
      const segment = getValue() as CustomerSegment
      const config = CUSTOMER_SEGMENT_CONFIG[segment]
      return h('span', {
        class: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        style: { color: config.color, backgroundColor: config.bgColor },
      }, [
        h(resolveComponent('Icon'), { name: config.icon, size: '12' }),
        config.label,
      ])
    },
    enableColumnFilter: true,
    size: 130,
  }),

  columnHelper.accessor('totalOrders', {
    header: 'Заказы',
    cell: ({ getValue }) => h('span', {
      class: 'text-sm tabular-nums text-gray-700 dark:text-gray-300',
    }, `${getValue()} шт.`),
    enableSorting: true,
    size: 100,
  }),

  columnHelper.accessor('totalSpent', {
    header: 'Потрачено',
    cell: ({ getValue }) => h('span', {
      class: 'text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums',
    }, formatCurrency(getValue())),
    enableSorting: true,
    size: 130,
  }),

  columnHelper.accessor('averageOrderValue', {
    header: 'Средний чек',
    cell: ({ getValue }) => h('span', {
      class: 'text-sm text-gray-600 dark:text-gray-400 tabular-nums',
    }, formatCurrency(getValue())),
    enableSorting: true,
    size: 130,
  }),

  columnHelper.accessor('lastOrderAt', {
    header: 'Последний заказ',
    cell: ({ getValue }) => {
      const date = getValue()
      return h('span', {
        class: 'text-sm text-gray-500',
      }, date ? formatRelativeDate(date) : 'Нет заказов')
    },
    enableSorting: true,
    size: 160,
  }),

  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => h('button', {
      class: 'p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
      title: 'Открыть профиль',
      onClick: () => navigateTo(`/customers/${row.original.id}`),
    }, h(resolveComponent('Icon'), { name: 'ph:arrow-right', size: '16' })),
    size: 60,
  }),
]

export const customerExportColumns = [
  { key: 'firstName', header: 'Имя' },
  { key: 'lastName', header: 'Фамилия' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Телефон' },
  { key: 'segment', header: 'Сегмент', transform: (v: CustomerSegment) => CUSTOMER_SEGMENT_CONFIG[v].label },
  { key: 'totalOrders', header: 'Заказов' },
  { key: 'totalSpent', header: 'Потрачено (₽)' },
  { key: 'averageOrderValue', header: 'Средний чек (₽)' },
  { key: 'createdAt', header: 'Дата регистрации' },
] as const
