<script setup lang="ts">
import { MAX_IMAGE_SIZE, ALLOWED_IMAGE_TYPES } from '@/shared/config/constants'

interface UploadedImage {
  id: string
  url: string
  alt?: string
  order: number
  file?: File
}

interface Props {
  modelValue: UploadedImage[]
  maxImages?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  maxImages: 10,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [images: UploadedImage[]]
}>()

const dropZone = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const errors = ref<string[]>([])

const canAdd = computed(() => props.modelValue.length < props.maxImages && !props.disabled)

function openFileDialog() {
  if (!canAdd.value) return
  fileInput.value?.click()
}

function handleDragEnter() { if (canAdd.value) isDragging.value = true }
function handleDragLeave() { isDragging.value = false }

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (!canAdd.value) return
  const files = Array.from(e.dataTransfer?.files ?? [])
  processFiles(files)
}

function handleFileChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  processFiles(files)
  if (fileInput.value) fileInput.value.value = ''
}

function processFiles(files: File[]) {
  errors.value = []
  const valid: File[] = []

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      errors.value.push(`${file.name}: недопустимый тип файла`)
      continue
    }
    if (file.size > MAX_IMAGE_SIZE) {
      errors.value.push(`${file.name}: файл слишком большой (макс. 5 МБ)`)
      continue
    }
    if (props.modelValue.length + valid.length >= props.maxImages) {
      errors.value.push(`Максимум ${props.maxImages} изображений`)
      break
    }
    valid.push(file)
  }

  if (valid.length === 0) return

  const newImages: UploadedImage[] = valid.map((file, i) => ({
    id: crypto.randomUUID(),
    url: URL.createObjectURL(file),
    order: props.modelValue.length + i,
    file,
  }))

  emit('update:modelValue', [...props.modelValue, ...newImages])
}

function removeImage(id: string) {
  emit('update:modelValue', props.modelValue.filter((img) => img.id !== id))
}
</script>

<template>
  <div class="space-y-3">
    <div
      ref="dropZone"
      class="relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer"
      :class="{
        'border-primary-400 bg-primary-50 dark:bg-primary-900/20': isDragging,
        'border-gray-300 dark:border-gray-600 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800': !isDragging && canAdd,
        'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed': !canAdd,
      }"
      @click="openFileDialog"
      @dragenter.prevent="handleDragEnter"
      @dragleave.prevent="handleDragLeave"
      @dragover.prevent
      @drop.prevent="handleDrop"
    >
      <Icon
        name="ph:upload-simple"
        size="32"
        class="mx-auto mb-2 text-gray-400"
      />
      <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Перетащите или
        <span class="text-primary-500">нажмите для выбора</span>
      </p>
      <p class="text-xs text-gray-400 mt-1">
        JPEG, PNG, WEBP · макс. 5 МБ · {{ modelValue.length }}/{{ maxImages }}
      </p>
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        class="hidden"
        @change="handleFileChange"
      >
    </div>

    <ul
      v-if="errors.length > 0"
      class="space-y-1"
    >
      <li
        v-for="error in errors"
        :key="error"
        class="text-xs text-red-500 flex items-center gap-1"
      >
        <Icon name="ph:warning-circle" size="12" />
        {{ error }}
      </li>
    </ul>

    <div
      v-if="modelValue.length > 0"
      class="grid grid-cols-4 gap-2"
    >
      <div
        v-for="image in modelValue"
        :key="image.id"
        class="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
      >
        <img
          :src="image.url"
          :alt="image.alt ?? 'Изображение'"
          class="w-full h-full object-cover"
        >
        <button
          v-if="!disabled"
          class="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          @click.stop="removeImage(image.id)"
        >
          <Icon name="ph:x" size="12" />
        </button>
      </div>
    </div>
  </div>
</template>
