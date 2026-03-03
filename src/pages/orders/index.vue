<script setup lang="ts">
import OrdersPage from './ui/OrdersPage.vue'

definePageMeta({ middleware: ['auth'] })
</script>

<template>
  <OrdersPage />
</template>
