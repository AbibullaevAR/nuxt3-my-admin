<script setup lang="ts">
import OrderDetailPage from './ui/OrderDetailPage.vue'

definePageMeta({ middleware: ['auth'] })
</script>

<template>
  <OrderDetailPage />
</template>
