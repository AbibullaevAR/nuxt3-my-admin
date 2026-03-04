<script setup lang="ts">
import CustomerTable from '@/widgets/customer-table/ui/CustomerTable.vue'
import PageHeader from '@/shared/ui/layout/PageHeader.vue'
import { useCustomerStore } from '@/entities/customer/model/customer.store'

const customerStore = useCustomerStore()
</script>

<template>
  <div class="p-6 space-y-5">
    <PageHeader
      title="Клиенты"
      :description="`${customerStore.total} клиентов · ${customerStore.vipCount} VIP`"
    />
    <CustomerTable />
  </div>
</template>
