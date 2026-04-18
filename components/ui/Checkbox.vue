<template>
  <input
    type="checkbox"
    :checked="modelValue ?? checked"
    :disabled="disabled"
    class="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
    :class="sizeClass"
    @change="onChange"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  checked: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  size: { type: String, default: 'md' },
})

const emit = defineEmits(['update:modelValue', 'change'])

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-3.5 h-3.5'
    case 'lg': return 'w-5 h-5'
    default: return 'w-4 h-4'
  }
})

function onChange(e) {
  emit('update:modelValue', e.target.checked)
  emit('change', e)
}
</script>
