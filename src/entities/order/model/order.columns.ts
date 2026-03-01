import { h } from 'vue'
import { createColumnHelper } from '@tanstack/vue-table'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Order, OrderStatus } from './order.types'
import { ORDER_STATUS_CONFIG, PAYMENT_METHOD_LABELS } from './order.types'
import { formatCurrency } from '@/shared/lib/helpers/currency'
import OrderStatusBadge from '../ui/OrderStatusBadge.vue'

const columnHelper = createColumnHelper<Order>()

export const orderColumns = [
  columnHelper.accessor('orderNumber', {
    header: '№ Заказа',
    cell: ({ getValue }) => h('span', {
      class: 'font-mono text-sm font-medium text-primary-600 dark:text-primary-400',
    }, getValue()),
    enableSorting: true,
    size: 160,
  }),

  columnHelper.accessor('customerName', {
    header: 'Клиент',
    cell: ({ row }) => h('div', { class: 'flex flex-col' }, [
      h('span', { class: 'text-sm font-medium text-gray-900 dark:text-gray-100' }, row.original.customerName),
      h('span', { class: 'text-xs text-gray-500' }, row.original.customerEmail),
    ]),
    enableSorting: true,
    size: 220,
  }),

  columnHelper.accessor('status', {
    header: 'Статус',
    cell: ({ getValue }) => h(OrderStatusBadge, { status: getValue() }),
    enableColumnFilter: true,
    filterFn: (row, columnId, filterValues: OrderStatus[]) => {
      if (!filterValues || filterValues.length === 0) return true
      return filterValues.includes(row.getValue(columnId))
    },
    size: 140,
  }),

  columnHelper.accessor('items', {
    header: 'Товары',
    cell: ({ getValue }) => {
      const items = getValue()
      const count = items.reduce((sum, item) => sum + item.quantity, 0)
      return h('span', { class: 'text-sm text-gray-600 dark:text-gray-400' },
        `${count} шт. (${items.length} поз.)`)
    },
    enableSorting: false,
    size: 130,
  }),

  columnHelper.accessor('total', {
    header: 'Сумма',
    cell: ({ getValue, row }) => h('div', { class: 'flex flex-col items-end' }, [
      h('span', { class: 'text-sm font-semibold text-gray-900 dark:text-gray-100' }, formatCurrency(getValue())),
      row.original.discount > 0
        ? h('span', { class: 'text-xs text-red-500' }, `−${formatCurrency(row.original.discount)}`)
        : null,
    ]),
    enableSorting: true,
    size: 130,
  }),

  columnHelper.accessor('paymentMethod', {
    header: 'Оплата',
    cell: ({ getValue, row }) => h('div', { class: 'flex flex-col' }, [
      h('span', { class: 'text-sm text-gray-600 dark:text-gray-400' }, PAYMENT_METHOD_LABELS[getValue()]),
      h('span', {
        class: row.original.isPaid
          ? 'text-xs text-green-600 font-medium'
          : 'text-xs text-amber-600 font-medium',
      }, row.original.isPaid ? 'Оплачен' : 'Не оплачен'),
    ]),
    enableColumnFilter: true,
    size: 160,
  }),

  columnHelper.accessor('createdAt', {
    header: 'Дата',
    cell: ({ getValue }) => h('div', { class: 'flex flex-col' }, [
      h('span', { class: 'text-sm text-gray-900 dark:text-gray-100' },
        format(new Date(getValue()), 'd MMM yyyy', { locale: ru })),
      h('span', { class: 'text-xs text-gray-500' },
        format(new Date(getValue()), 'HH:mm')),
    ]),
    enableSorting: true,
    sortingFn: 'datetime',
    size: 120,
  }),

  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) => h('div', {
      class: 'flex items-center gap-1',
    }, [
      h('button', {
        class: 'p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
        title: 'Открыть заказ',
        onClick: () => navigateTo(`/orders/${row.original.id}`),
      }, h(resolveComponent('Icon'), { name: 'ph:eye', size: '18' })),
      h('button', {
        class: 'p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
        title: 'Скачать PDF',
      }, h(resolveComponent('Icon'), { name: 'ph:file-pdf', size: '18' })),
    ]),
    size: 80,
  }),
]

export const orderExportColumns = [
  { key: 'orderNumber', header: '№ Заказа' },
  { key: 'customerName', header: 'Клиент' },
  { key: 'customerEmail', header: 'Email' },
  { key: 'status', header: 'Статус', transform: (v: OrderStatus) => ORDER_STATUS_CONFIG[v].label },
  { key: 'total', header: 'Сумма (₽)' },
  { key: 'discount', header: 'Скидка (₽)' },
  { key: 'paymentMethod', header: 'Способ оплаты', transform: (v: string) => PAYMENT_METHOD_LABELS[v as keyof typeof PAYMENT_METHOD_LABELS] },
  { key: 'isPaid', header: 'Оплачен', transform: (v: boolean) => v ? 'Да' : 'Нет' },
  { key: 'createdAt', header: 'Дата', transform: (v: string) => format(new Date(v), 'dd.MM.yyyy HH:mm') },
] as const
