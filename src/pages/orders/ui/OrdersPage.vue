<script setup lang="ts">
import OrdersTable from '@/widgets/orders-table/ui/OrdersTable.vue'
import PageHeader from '@/shared/ui/layout/PageHeader.vue'
import { useOrderStore } from '@/entities/order/model/order.store'

const orderStore = useOrderStore()

onMounted(() => orderStore.fetchOrders())
</script>

<template>
  <div class="p-6 space-y-5">
    <PageHeader
      title="Заказы"
      :description="`Всего ${orderStore.total} заказов`"
    >
      <template #actions>
        <NuxtLink
          to="/orders/create"
          class="btn-primary flex items-center gap-1.5"
        >
          <Icon name="ph:plus" size="16" />
          Новый заказ
        </NuxtLink>
      </template>
    </PageHeader>

    <OrdersTable />
  </div>
</template>
