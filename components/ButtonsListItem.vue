<template>
  <Button
    variant="list-item"
    :color="danger ? 'red' : 'primary'"
    :disabled="disabled"
    @click="!disabled && $emit('click')"
  >
    <Icon v-if="icon" :name="icon" class="w-[18px] h-[18px] flex-shrink-0"
      :class="iconClass || (danger ? '' : 'text-gray-400')" />
    <span class="flex-1 text-left truncate">
      <slot />
    </span>
    <slot name="suffix">
      <Icon v-if="chevron" name="mdi:chevron-right" class="w-4 h-4 flex-shrink-0"
        :class="danger ? 'text-red-300 dark:text-red-800' : 'text-gray-300 dark:text-gray-600'" />
    </slot>
  </Button>
</template>

<script setup>
defineProps({
  /** MDI icon name */
  icon: { type: String, default: '' },
  /** Custom icon class override */
  iconClass: { type: String, default: '' },
  /** Show chevron-right suffix (default true) */
  chevron: { type: Boolean, default: true },
  /** Danger/red styling */
  danger: { type: Boolean, default: false },
  /** Disabled state */
  disabled: { type: Boolean, default: false },
})

defineEmits(['click'])
</script>
