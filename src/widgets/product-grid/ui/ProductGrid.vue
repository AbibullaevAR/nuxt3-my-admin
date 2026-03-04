<script setup lang="ts">
import { vAutoAnimate } from '@formkit/auto-animate'
import ProductCard from '@/entities/product/ui/ProductCard.vue'
import { useProductStore } from '@/entities/product/model/product.store'

const productStore = useProductStore()

onMounted(() => productStore.fetchProducts())
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div class="flex items-center gap-3">
        <input
          type="search"
          placeholder="Поиск товаров..."
          class="input max-w-xs"
          @input="productStore.fetchProducts({ search: ($event.target as HTMLInputElement).value, page: 1 })"
        >

        <select
          class="input max-w-[160px]"
          @change="productStore.fetchProducts({ status: [($event.target as HTMLSelectElement).value as any], page: 1 })"
        >
          <option value="">
            Все статусы
          </option>
          <option value="active">
            Активные
          </option>
          <option value="draft">
            Черновики
          </option>
          <option value="archived">
            Архив
          </option>
          <option value="out_of_stock">
            Нет в наличии
          </option>
        </select>
      </div>

      <NuxtLink
        to="/products/create"
        class="btn-primary flex items-center gap-1.5"
      >
        <Icon name="ph:plus" size="16" />
        Добавить товар
      </NuxtLink>
    </div>

    <div
      v-if="productStore.isLoading"
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
    >
      <div
        v-for="i in 10"
        :key="i"
        class="card animate-pulse overflow-hidden"
      >
        <div class="aspect-square bg-gray-200 dark:bg-gray-700" />
        <div class="p-4 space-y-2">
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    </div>

    <div
      v-else
      v-auto-animate
      class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
    >
      <ProductCard
        v-for="product in productStore.products"
        :key="product.id"
        :product="product"
      />

      <div
        v-if="productStore.products.length === 0"
        class="col-span-full py-20 text-center"
      >
        <Icon
          name="ph:package"
          size="56"
          class="mx-auto mb-3 text-gray-200 dark:text-gray-700"
        />
        <p class="text-gray-400">
          Товары не найдены
        </p>
      </div>
    </div>

    <div
      v-if="productStore.totalPages > 1"
      class="flex items-center justify-center gap-2"
    >
      <button
        class="btn-secondary px-3 py-1.5 text-sm"
        :disabled="productStore.page === 1"
        @click="productStore.fetchProducts({ page: productStore.page - 1 })"
      >
        Назад
      </button>
      <span class="text-sm text-gray-600 dark:text-gray-400">
        {{ productStore.page }} / {{ productStore.totalPages }}
      </span>
      <button
        class="btn-secondary px-3 py-1.5 text-sm"
        :disabled="productStore.page === productStore.totalPages"
        @click="productStore.fetchProducts({ page: productStore.page + 1 })"
      >
        Далее
      </button>
    </div>
  </div>
</template>
