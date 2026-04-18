<template>
  <div :class="[wrapperClass, containerClass]" role="group">
    <UiButton
      v-for="(opt, idx) in options"
      :key="opt.value"
      variant="ghost"
      :icon-only="!opt.label"
      :size="buttonSize"
      :class="[
        roundingClass(idx),
        modelValue === opt.value ? activeClass : inactiveClass,
        opt.label ? 'flex-1' : '',
      ]"
      :title="opt.title || opt.label || ''"
      @click="$emit('update:modelValue', opt.value)"
    >
      <Icon v-if="opt.icon" :name="opt.icon" :class="iconClass" class="block" />
      <span v-if="opt.label">{{ opt.label }}</span>
    </UiButton>
  </div>
</template>

<script setup>
const props = defineProps({
  /** Currently selected value (v-model) */
  modelValue: { type: [String, Number, Boolean], default: '' },
  /** Array of options: { value, icon?, label?, title? } */
  options: { type: Array, required: true },
  /** Visual style: 'toolbar' (icon toggles) or 'tabs' (text tabs) */
  variant: { type: String, default: 'toolbar' },
  /** Icon size class for toolbar variant */
  iconClass: { type: String, default: 'w-5 h-5' },
  /** Button size: 'xs' | 'sm' | 'md' (toolbar only) */
  size: { type: String, default: 'md' },
  /** Full width (default: true for tabs, false for toolbar) */
  block: { type: Boolean, default: undefined },
})

defineEmits(['update:modelValue'])

const isBlock = computed(() => props.block ?? props.variant === 'tabs')

const wrapperClass = computed(() =>
  isBlock.value ? 'flex items-center rounded-lg' : 'inline-flex items-center rounded-lg'
)

const containerClass = computed(() =>
  props.variant === 'tabs'
    ? 'bg-gray-100 dark:bg-gray-800 p-0.5'
    : 'bg-gray-200/50 dark:bg-gray-800'
)

const buttonSize = computed(() =>
  props.variant === 'tabs' ? 'xs' : props.size
)

const roundingClass = (idx) => {
  const last = props.options.length - 1
  const radius = props.variant === 'tabs' ? 'md' : 'lg'
  if (props.options.length === 1) return `rounded-${radius}`
  if (idx === 0) return `rounded-l-${radius} rounded-r-none`
  if (idx === last) return `rounded-r-${radius} rounded-l-none`
  return 'rounded-none'
}

const activeClass = computed(() =>
  props.variant === 'tabs'
    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm hover:bg-white dark:hover:bg-gray-700'
    : 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm hover:bg-white dark:hover:bg-gray-700'
)

const inactiveClass = computed(() =>
  props.variant === 'tabs'
    ? 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-300/40 dark:hover:bg-gray-700/50'
)
</script>
