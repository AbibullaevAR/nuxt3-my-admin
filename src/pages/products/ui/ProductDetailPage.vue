<script setup lang="ts">
import ProductForm from '@/features/manage-product/ui/ProductForm.vue'
import ProductPriceBadge from '@/entities/product/ui/ProductPriceBadge.vue'
import PageHeader from '@/shared/ui/layout/PageHeader.vue'
import { useProductStore } from '@/entities/product/model/product.store'
import type { Product } from '@/entities/product/model/product.types'

const route = useRoute()
const productStore = useProductStore()
const productId = route.params.id as string

onMounted(() => productStore.fetchProductById(productId))

const product = computed(() => productStore.currentProduct)

async function handleSaved(updated: Product) {
  productStore.currentProduct = updated
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
      <PageHeader
        v-if="product"
        :title="product.name"
      >
        <template #actions>
          <ProductPriceBadge
            :price="product.price"
            :compare-at-price="product.compareAtPrice"
          />
        </template>
      </PageHeader>
    </div>

    <div
      v-if="productStore.isLoading"
      class="py-20 text-center"
    >
      <Icon
        name="ph:spinner"
        size="40"
        class="animate-spin text-primary-500 mx-auto"
      />
    </div>

    <ProductForm
      v-else-if="product"
      :product="product"
      @saved="handleSaved"
    />
  </div>
</template>
