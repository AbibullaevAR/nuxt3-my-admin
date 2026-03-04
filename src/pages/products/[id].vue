<script setup lang="ts">
import ProductDetailPage from './ui/ProductDetailPage.vue'

definePageMeta({ middleware: ['auth'] })
</script>

<template>
  <ProductDetailPage />
</template>
