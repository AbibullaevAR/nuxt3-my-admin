<script setup lang="ts">
import ProductGrid from '@/widgets/product-grid/ui/ProductGrid.vue'
import PageHeader from '@/shared/ui/layout/PageHeader.vue'
import { useProductStore } from '@/entities/product/model/product.store'

const productStore = useProductStore()
</script>

<template>
  <div class="p-6 space-y-5">
    <PageHeader
      title="Товары"
      :description="`${productStore.total} товаров · ${productStore.activeCount} активных`"
    >
      <template #actions>
        <NuxtLink
          to="/products/create"
          class="btn-primary flex items-center gap-1.5"
        >
          <Icon name="ph:plus" size="16" />
          Добавить товар
        </NuxtLink>
      </template>
    </PageHeader>

    <ProductGrid />
  </div>
</template>
