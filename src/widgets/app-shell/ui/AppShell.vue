<script setup lang="ts">
import SidebarNav from '@/widgets/sidebar-nav/ui/SidebarNav.vue'
import ThemeToggle from '@/features/theme-toggle/ui/ThemeToggle.vue'
import NotificationBell from '@/features/notifications/ui/NotificationBell.vue'
import CommandPalette from '@/features/search-global/ui/CommandPalette.vue'
import { useSearchStore } from '@/features/search-global/model/search.store'
import { useUserStore } from '@/entities/user/model/user.store'
import { useWebSocketProvider } from '@/app/providers'

const sidebarCollapsed = ref(false)
const searchStore = useSearchStore()
const userStore = useUserStore()
const route = useRoute()

useWebSocketProvider()

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': 'Дашборд',
    '/orders': 'Заказы',
    '/products': 'Товары',
    '/customers': 'Клиенты',
    '/analytics': 'Аналитика',
    '/settings': 'Настройки',
  }
  const key = Object.keys(titles).find((k) => route.path.startsWith(k))
  return key ? titles[key] : 'ShopAdmin'
})

const userInitial = computed(() => userStore.fullName?.charAt(0)?.toUpperCase() || 'A')
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-[#f8f9fc] dark:bg-[#0d1117]">
    <SidebarNav
      :collapsed="sidebarCollapsed"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <header class="flex items-center justify-between gap-4 px-6 h-16 bg-white dark:bg-[#161b27] border-b border-gray-100 dark:border-[#21293a] shrink-0">
        <div class="flex items-center gap-3">
          <h1 class="text-base font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
            {{ pageTitle }}
          </h1>
        </div>

        <div class="flex items-center gap-1.5">
          <button
            class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400
                   bg-gray-100 dark:bg-[#1a1f2e] rounded-xl
                   hover:bg-gray-200 dark:hover:bg-[#21293a]
                   transition-colors"
            @click="searchStore.open"
          >
            <Icon name="ph:magnifying-glass" size="15" />
            <span class="hidden sm:inline text-gray-400 dark:text-gray-500 text-xs">Поиск</span>
            <kbd class="hidden sm:flex items-center gap-0.5 text-xs font-medium
                        text-gray-400 dark:text-gray-600
                        bg-white dark:bg-[#0d1117]
                        border border-gray-200 dark:border-[#21293a]
                        px-1.5 py-0.5 rounded-md">
              ⌘K
            </kbd>
          </button>

          <ThemeToggle />
          <NotificationBell />

          <div class="w-px h-6 bg-gray-200 dark:bg-[#21293a] mx-1" />

          <button class="flex items-center gap-2 py-1 px-2 rounded-xl hover:bg-gray-100 dark:hover:bg-[#1a1f2e] transition-colors">
            <div class="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-xs font-semibold text-white shadow-sm">
              {{ userInitial }}
            </div>
            <span class="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
              {{ userStore.fullName || 'Администратор' }}
            </span>
            <Icon name="ph:caret-down" size="12" class="text-gray-400 dark:text-gray-600" />
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>

    <CommandPalette />
  </div>
</template>
