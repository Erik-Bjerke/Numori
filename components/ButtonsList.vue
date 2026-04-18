<template>
  <div>
    <p v-if="label" class="text-[10px] font-medium uppercase tracking-wider px-1 mb-1.5"
      :class="danger ? 'text-red-400 dark:text-red-600' : 'text-gray-400 dark:text-gray-600'">
      {{ label }}
    </p>
    <div class="overflow-hidden divide-y"
      :class="[
        shapeClass,
        danger
          ? 'bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 divide-red-100 dark:divide-red-900/30'
          : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 divide-gray-100 dark:divide-gray-800'
      ]">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  /** Section label shown above the list */
  label: { type: String, default: '' },
  /** Use danger/red styling for the container */
  danger: { type: Boolean, default: false },
  /** Border radius: 'xl' (default), 'lg', 'none' */
  rounded: { type: String, default: 'xl' },
})

const shapeClass = computed(() => {
  const map = { xl: 'rounded-xl', lg: 'rounded-lg', none: '' }
  return map[props.rounded] ?? map.xl
})
</script>
