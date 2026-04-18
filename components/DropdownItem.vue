<template>
  <Button @click="handleClick" variant="menu-item"
    :class="disabled ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : ''"
    :disabled="disabled">
    <Icon :name="icon" class="w-4 h-4 block flex-shrink-0" />
    <span class="flex-1 text-left">{{ label }}</span>
    <span v-if="shortcut" class="text-xs text-gray-400 dark:text-gray-500">{{ shortcut }}</span>
  </Button>
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
  if (!props.disabled) emit('click')
}
</script>
