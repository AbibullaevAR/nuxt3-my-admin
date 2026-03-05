<script setup lang="ts">
import { useSearchStore } from '../model/search.store'

const searchStore = useSearchStore()

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    searchStore.toggle()
  }
  if (e.key === 'Escape' && searchStore.isOpen) {
    searchStore.close()
  }
  if (searchStore.isOpen) {
    if (e.key === 'ArrowUp') { e.preventDefault(); searchStore.navigateUp() }
    if (e.key === 'ArrowDown') { e.preventDefault(); searchStore.navigateDown() }
    if (e.key === 'Enter') { e.preventDefault(); searchStore.selectResult() }
  }
}

const TYPE_LABELS: Record<string, string> = {
  action: 'Действия',
  page: 'Страницы',
  order: 'Заказы',
  product: 'Товары',
  customer: 'Клиенты',
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-all duration-200"
      leave-to-class="opacity-0"
    >
      <div
        v-if="searchStore.isOpen"
        class="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
        @click.self="searchStore.close"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <div class="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div class="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 dark:border-gray-700">
            <Icon
              name="ph:magnifying-glass"
              size="20"
              class="text-gray-400 shrink-0"
            />
            <input
              v-model="searchStore.query"
              type="text"
              placeholder="Поиск... (Esc для закрытия)"
              class="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400"
              autofocus
            >
            <kbd class="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded text-gray-500">
              Esc
            </kbd>
          </div>

          <div class="max-h-[60vh] overflow-y-auto">
            <div
              v-if="searchStore.results.length === 0 && searchStore.query"
              class="py-10 text-center text-sm text-gray-400"
            >
              Ничего не найдено по «{{ searchStore.query }}»
            </div>

            <div
              v-else-if="searchStore.results.length === 0"
              class="py-8 text-center"
            >
              <p class="text-sm text-gray-400">
                Начните вводить для поиска
              </p>
              <p class="text-xs text-gray-300 dark:text-gray-600 mt-1">
                Заказы, товары, клиенты, страницы
              </p>
            </div>

            <div
              v-for="group in searchStore.groupedResults"
              :key="group.type"
            >
              <div class="px-3 py-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {{ TYPE_LABELS[group.type] ?? group.type }}
              </div>

              <button
                v-for="(result, index) in group.results"
                :key="result.item.id"
                class="w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-lg mx-1 transition-colors"
                :class="{
                  'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300':
                    searchStore.results.indexOf(result) === searchStore.activeIndex,
                  'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300':
                    searchStore.results.indexOf(result) !== searchStore.activeIndex,
                }"
                @click="searchStore.selectResult(searchStore.results.indexOf(result))"
              >
                <Icon
                  :name="result.item.icon ?? 'ph:arrow-right'"
                  size="18"
                  class="shrink-0"
                />
                <span
                  class="text-sm"
                  v-html="result.item.title"
                />
              </button>
            </div>
          </div>

          <div class="flex items-center gap-4 px-4 py-2.5 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400">
            <span class="flex items-center gap-1">
              <kbd class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↑↓</kbd>
              навигация
            </span>
            <span class="flex items-center gap-1">
              <kbd class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">↵</kbd>
              открыть
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
