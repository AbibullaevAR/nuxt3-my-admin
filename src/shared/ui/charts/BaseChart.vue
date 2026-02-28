<script setup lang="ts">
import type { EChartsOption } from 'echarts'

interface Props {
  option: EChartsOption
  height?: string
  loading?: boolean
  theme?: 'light' | 'dark'
}

withDefaults(defineProps<Props>(), {
  height: '320px',
  loading: false,
})

const colorMode = useColorMode()
const chartTheme = computed(() =>
  colorMode.value === 'dark' ? 'dark' : undefined,
)
</script>

<template>
  <ClientOnly>
    <div
      class="w-full"
      :style="{ height }"
    >
      <div
        v-if="loading"
        class="w-full h-full flex items-center justify-center"
      >
        <Icon
          name="ph:spinner"
          size="32"
          class="animate-spin text-primary-400"
        />
      </div>
      <VChart
        v-else
        class="w-full h-full"
        :option="option"
        :theme="theme ?? chartTheme"
        autoresize
      />
    </div>

    <template #fallback>
      <div
        class="w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl"
        :style="{ height }"
      />
    </template>
  </ClientOnly>
</template>
