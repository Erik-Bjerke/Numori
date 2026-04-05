<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4">
    <div v-if="visible"
      class="fixed bottom-4 left-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm"
      role="alert">
      <Icon name="mdi:update" class="w-5 h-5 flex-shrink-0 text-primary-600 dark:text-primary-400" />
      <p class="text-sm text-gray-700 dark:text-gray-300 flex-1">
        {{ isNative ? 'A new version is available in the store.' : 'A new version is available.' }}
      </p>
      <div class="flex items-center gap-2 flex-shrink-0">
        <button @click="$emit('apply')"
          class="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors">
          {{ isNative ? 'Update' : 'Reload' }}
        </button>
        <button @click="$emit('dismiss')"
          class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Dismiss">
          <Icon name="mdi:close" class="w-4 h-4" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  isNative: { type: Boolean, default: false }
})

defineEmits(['apply', 'dismiss'])
</script>
