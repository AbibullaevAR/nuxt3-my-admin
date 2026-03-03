<script setup lang="ts">
import OrderCreateForm from '@/features/manage-order/ui/OrderCreateForm.vue'
import PageHeader from '@/shared/ui/layout/PageHeader.vue'

definePageMeta({ middleware: ['auth'] })

async function handleSaved(orderId: string) {
  await navigateTo(`/orders/${orderId}`)
}
</script>

<template>
  <div class="p-6 space-y-5">
    <div class="flex items-center gap-3">
      <button
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
        @click="navigateTo('/orders')"
      >
        <Icon name="ph:arrow-left" size="20" />
      </button>
      <PageHeader title="Новый заказ" />
    </div>

    <OrderCreateForm @saved="handleSaved" />
  </div>
</template>
