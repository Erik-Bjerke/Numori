<template>
  <button
    type="button"
    :disabled="disabled"
    class="relative inline-flex items-center flex-shrink-0 rounded-full transition-colors"
    :class="[
      sizeClasses.track,
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      modelValue ? activeColor : inactiveColor
    ]"
    role="switch"
    :aria-checked="modelValue"
    @click="toggle"
  >
    <span
      class="inline-block transform rounded-full bg-white transition-transform"
      :class="[
        sizeClasses.dot,
        modelValue ? sizeClasses.translateOn : sizeClasses.translateOff
      ]"
    />
  </button>
</template>

<script setup>
const props = defineProps({
  /** v-model binding */
  modelValue: { type: Boolean, default: false },
  /** Disabled state */
  disabled: { type: Boolean, default: false },
  /** Read-only — renders visually but doesn't handle clicks (parent handles toggling) */
  readonly: { type: Boolean, default: false },
  /** Size: 'sm' (h-5 w-9, ProfileModal style) or 'md' (h-6 w-11, SettingsModal style) */
  size: { type: String, default: 'md' },
  /** Active track color */
  color: { type: String, default: 'primary' },
})

const emit = defineEmits(['update:modelValue'])

const activeColor = computed(() => {
  if (props.size === 'sm') {
    // ProfileModal style uses 600
    const map = { primary: 'bg-primary-600', green: 'bg-success-600', red: 'bg-red-600' }
    return map[props.color] ?? map.primary
  }
  // SettingsModal style uses 500
  const map = { primary: 'bg-primary-500', green: 'bg-success-500', red: 'bg-red-500' }
  return map[props.color] ?? map.primary
})

const inactiveColor = computed(() => {
  // sm (ProfileModal): bg-gray-300 dark:bg-gray-600
  // md (SettingsModal): bg-gray-300 dark:bg-gray-700
  return props.size === 'sm' ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-300 dark:bg-gray-700'
})

const sizeClasses = computed(() => {
  if (props.size === 'sm') {
    return { track: 'h-5 w-9 border-2 border-transparent', dot: 'h-4 w-4 shadow', translateOn: 'translate-x-4', translateOff: 'translate-x-0' }
  }
  return { track: 'h-6 w-11', dot: 'h-4 w-4', translateOn: 'translate-x-6', translateOff: 'translate-x-1' }
})

const toggle = () => {
  if (!props.disabled && !props.readonly) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>
