<script setup lang="ts">
import { NAV_ITEMS } from '@/shared/config/constants'

interface Props {
  collapsed?: boolean
}

withDefaults(defineProps<Props>(), {
  collapsed: false,
})

const emit = defineEmits<{ 'toggle': [] }>()
const route = useRoute()

function isActive(path: string) {
  return route.path.startsWith(path)
}
</script>

<template>
  <aside
    class="flex flex-col h-full bg-[#0f1117] transition-all duration-300 shrink-0"
    :style="{ width: collapsed ? '72px' : '260px' }"
  >
    <div
      class="flex items-center gap-3 px-4 border-b border-white/[0.06]"
      :class="collapsed ? 'py-[18px] justify-center' : 'py-[18px]'"
    >
      <div class="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary-900/40">
        <Icon name="ph:shopping-cart-simple" size="17" class="text-white" />
      </div>
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-100"
        leave-to-class="opacity-0"
      >
        <span
          v-if="!collapsed"
          class="font-bold text-white whitespace-nowrap tracking-tight"
        >
          ShopAdmin
        </span>
      </Transition>
    </div>

    <nav class="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
      <NuxtLink
        v-for="item in NAV_ITEMS"
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
        :class="{
          'bg-primary-600/15 text-primary-300': isActive(item.path),
          'text-gray-400 hover:bg-white/[0.06] hover:text-gray-100': !isActive(item.path),
        }"
        :title="collapsed ? item.label : undefined"
      >
        <Icon
          :name="item.icon"
          size="20"
          class="shrink-0 transition-colors"
          :class="isActive(item.path) ? 'text-primary-400' : 'text-gray-500'"
        />
        <Transition
          enter-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          leave-active-class="transition-opacity duration-100"
          leave-to-class="opacity-0"
        >
          <span
            v-if="!collapsed"
            class="whitespace-nowrap"
          >
            {{ item.label }}
          </span>
        </Transition>

        <Transition name="fade">
          <span
            v-if="isActive(item.path) && !collapsed"
            class="ml-auto w-1 h-4 bg-primary-500 rounded-full"
          />
        </Transition>
      </NuxtLink>
    </nav>

    <div class="px-2 py-3 border-t border-white/[0.06]">
      <button
        class="w-full flex items-center justify-center p-2.5 rounded-xl text-gray-500 hover:text-gray-200 hover:bg-white/[0.06] transition-colors"
        :title="collapsed ? 'Развернуть меню' : 'Свернуть меню'"
        @click="emit('toggle')"
      >
        <Icon
          :name="collapsed ? 'ph:arrow-right' : 'ph:arrow-left'"
          size="16"
        />
      </button>
    </div>
  </aside>
</template>
