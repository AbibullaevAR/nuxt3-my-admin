<script setup lang="ts">
import ProductForm from '@/features/manage-product/ui/ProductForm.vue'
import PageHeader from '@/shared/ui/layout/PageHeader.vue'
import type { Product } from '@/entities/product/model/product.types'

definePageMeta({ middleware: ['auth'] })

async function handleSaved(product: Product) {
  await navigateTo(`/products/${product.id}`)
}
</script>

<template>
  <div class="p-6 space-y-5">
    <div class="flex items-center gap-3">
      <button
        class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
        @click="navigateTo('/products')"
      >
        <Icon name="ph:arrow-left" size="20" />
      </button>
      <PageHeader title="Новый товар" />
    </div>
    <ProductForm @saved="handleSaved" />
  </div>
</template>
