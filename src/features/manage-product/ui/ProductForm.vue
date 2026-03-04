<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import type { Product, ProductCreate } from '@/entities/product/model/product.types'
import { ProductCreateSchema } from '@/entities/product/model/product.types'
import { useProductStore } from '@/entities/product/model/product.store'
import { useCategoryStore } from '@/entities/category/model/category.store'
import ImageUpload from '@/features/image-upload/ui/ImageUpload.vue'

interface Props {
  product?: Product
}

const props = defineProps<Props>()
const emit = defineEmits<{ saved: [product: Product] }>()

const productStore = useProductStore()
const categoryStore = useCategoryStore()

const isEdit = computed(() => !!props.product)

const { handleSubmit, isSubmitting, setValues, values } = useForm<ProductCreate>({
  validationSchema: toTypedSchema(ProductCreateSchema),
  initialValues: props.product
    ? { ...props.product }
    : { status: 'draft', stock: 0, lowStockThreshold: 5, tags: [], images: [] },
})

onMounted(() => categoryStore.fetchAll())

const images = ref(props.product?.images ?? [])

const onSubmit = handleSubmit(async (data) => {
  const payload = { ...data, images: images.value }
  const result = isEdit.value
    ? await productStore.updateProduct(props.product!.id, payload)
    : await productStore.createProduct(payload as ProductCreate)
  emit('saved', result)
})
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="onSubmit"
  >
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-5">
        <div class="card-padded space-y-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Основная информация
          </h3>

          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Название *</label>
            <input
              v-model="values.name"
              type="text"
              class="input"
              placeholder="Название товара"
            >
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Цена (₽) *</label>
              <input
                v-model.number="values.price"
                type="number"
                class="input"
                min="0"
                step="0.01"
              >
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Цена до скидки (₽)</label>
              <input
                v-model.number="values.compareAtPrice"
                type="number"
                class="input"
                min="0"
                step="0.01"
              >
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Артикул *</label>
              <input
                v-model="values.sku"
                type="text"
                class="input font-mono"
                placeholder="XX-0000"
              >
            </div>
            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Остаток *</label>
              <input
                v-model.number="values.stock"
                type="number"
                class="input"
                min="0"
              >
            </div>
          </div>
        </div>

        <div class="card-padded space-y-4">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Изображения
          </h3>
          <ImageUpload
            v-model="images"
            :max-images="10"
          />
        </div>
      </div>

      <div class="space-y-5">
        <div class="card-padded space-y-3">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Публикация
          </h3>
          <div class="space-y-1.5">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Статус</label>
            <select
              v-model="values.status"
              class="input"
            >
              <option value="draft">
                Черновик
              </option>
              <option value="active">
                Активен
              </option>
              <option value="archived">
                В архиве
              </option>
            </select>
          </div>

          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="values.isFeatured"
              type="checkbox"
              class="rounded border-gray-300 text-primary-600"
            >
            <span class="text-sm text-gray-700 dark:text-gray-300">Рекомендуемый</span>
          </label>
        </div>

        <div class="card-padded space-y-3">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Категория
          </h3>
          <select
            v-model="values.categoryId"
            class="input"
          >
            <option value="">
              Выберите категорию
            </option>
            <option
              v-for="cat in categoryStore.activeCategories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>

        <button
          type="submit"
          class="btn-primary w-full"
          :disabled="isSubmitting"
        >
          <Icon
            v-if="isSubmitting"
            name="ph:spinner"
            size="16"
            class="animate-spin mr-2"
          />
          {{ isEdit ? 'Сохранить изменения' : 'Создать товар' }}
        </button>
      </div>
    </div>
  </form>
</template>
