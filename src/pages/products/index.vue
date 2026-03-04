<script setup lang="ts">
import ProductsPage from './ui/ProductsPage.vue'

definePageMeta({ middleware: ['auth'] })
</script>

<template>
  <ProductsPage />
</template>
