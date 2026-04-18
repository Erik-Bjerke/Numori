<template>
  <input
    type="range"
    :min="min"
    :max="max"
    :step="step"
    :value="modelValue"
    :disabled="disabled"
    class="accent-primary-500"
    :class="widthClass"
    @input="onInput"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  min: { type: [Number, String], default: 0 },
  max: { type: [Number, String], default: 100 },
  step: { type: [Number, String], default: 1 },
  disabled: { type: Boolean, default: false },
  /** 'full' | 'flex' — full = w-full, flex = flex-1 */
  width: { type: String, default: 'full' },
})

const emit = defineEmits(['update:modelValue', 'input'])

const widthClass = computed(() => {
  switch (props.width) {
    case 'flex': return 'flex-1 h-1.5'
    default: return 'w-full'
  }
})

function onInput(e) {
  const val = Number(e.target.value)
  emit('update:modelValue', val)
  emit('input', e)
}
</script>
