<template>
  <button @click="handleClick"
    class="w-full flex items-center gap-3 px-3 py-1.5 text-sm transition-colors"
    :class="disabled
      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-850'"
    :disabled="disabled">
    <Icon :name="icon" class="w-4 h-4 block flex-shrink-0" />
    <span class="flex-1 text-left">{{ label }}</span>
    <span v-if="shortcut" class="text-xs text-gray-400 dark:text-gray-500">{{ shortcut }}</span>
  </button>
</template>

<script setup>
const props = defineProps({
  icon: { type: String, required: true },
  label: { type: String, required: true },
  shortcut: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>
