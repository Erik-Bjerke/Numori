<template>
  <label
    class="inline-flex items-center gap-2 cursor-pointer transition-colors"
    :class="disabled ? 'opacity-50 pointer-events-none' : ''"
  >
    <slot />
    <input
      ref="inputRef"
      type="file"
      class="hidden"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      @change="onChange"
    />
  </label>
</template>

<script setup>
const props = defineProps({
  accept: { type: String, default: undefined },
  multiple: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  /** Max file size in bytes. 0 = no limit */
  maxSize: { type: Number, default: 0 },
})

const emit = defineEmits(['select', 'error'])

const inputRef = ref(null)

function onChange(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return

  if (props.maxSize > 0) {
    const oversized = files.find(f => f.size > props.maxSize)
    if (oversized) {
      const maxMB = (props.maxSize / 1024 / 1024).toFixed(1)
      emit('error', { type: 'maxSize', file: oversized, message: `File exceeds ${maxMB} MB limit` })
      e.target.value = ''
      return
    }
  }

  emit('select', props.multiple ? files : files[0])
  e.target.value = ''
}

defineExpose({
  open: () => inputRef.value?.click(),
  el: inputRef,
})
</script>
