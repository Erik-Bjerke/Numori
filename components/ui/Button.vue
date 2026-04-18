<template>
  <component
    :is="tag"
    :type="isButton ? nativeType : undefined"
    :disabled="isButton ? (disabled || loading) : undefined"
    :href="tag === 'a' ? href : undefined"
    :class="mergedClasses"
    :title="title"
    :aria-label="ariaLabel"
    :aria-checked="ariaChecked"
    :role="role"
    :tabindex="tabindex"
    v-bind="restAttrs"
  >
    <!-- Loading spinner -->
    <Icon v-if="loading" :name="spinnerIcon" class="animate-spin" :class="spinnerSizeClass" />
    <!-- Default slot -->
    <slot v-else />
  </component>
</template>

<script setup>
import { twMerge } from 'tailwind-merge'
const props = defineProps({
  /** HTML tag: 'button' | 'a' | 'div' etc. */
  tag: { type: String, default: 'button' },
  /** Native button type: 'button' | 'submit' | 'reset' */
  nativeType: { type: String, default: 'button' },

  /**
   * Visual variant:
   * 'solid', 'outline', 'ghost', 'dashed', 'text', 'link', 'menu-item', 'list-item'
   */
  variant: { type: String, default: 'solid' },

  /**
   * Colour key — maps to tailwind colour scales.
   * 'primary' | 'gray' | 'red' | 'green' | 'amber' | 'white'
   */
  color: { type: String, default: 'primary' },

  /** Size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' */
  size: { type: String, default: 'md' },

  /** Shape: 'round' | 'pill' | 'square' | 'circle' | 'none' */
  shape: { type: String, default: 'round' },

  /** Disabled state */
  disabled: { type: Boolean, default: false },

  /** Loading state — shows spinner, disables button */
  loading: { type: Boolean, default: false },

  /** Loading spinner icon name */
  spinner: { type: String, default: 'mdi:loading' },

  /** Block / full-width */
  block: { type: Boolean, default: false },

  /** Icon-only mode — equal width/height padding */
  iconOnly: { type: Boolean, default: false },

  /** href for anchor tags */
  href: { type: String, default: undefined },

  /** Accessibility */
  title: { type: String, default: undefined },
  ariaLabel: { type: String, default: undefined },
  ariaChecked: { type: [String, Boolean], default: undefined },
  role: { type: String, default: undefined },
  tabindex: { type: [String, Number], default: undefined },
})

defineOptions({ inheritAttrs: false })

const isButton = computed(() => props.tag === 'button')
const isMenuItem = computed(() => props.variant === 'menu-item')
const isListItem = computed(() => props.variant === 'list-item')
const isInlineVariant = computed(() => isMenuItem.value || isListItem.value)

const spinnerIcon = computed(() => props.spinner)

const spinnerSizeClass = computed(() => {
  const map = { xs: 'w-3 h-3', sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5', xl: 'w-6 h-6' }
  return map[props.size] || map.md
})

// ── Size classes ──────────────────────────────────────────
const sizeClasses = computed(() => {
  if (isMenuItem.value) return 'px-3 py-1.5 text-sm gap-2'
  if (isListItem.value) return 'px-3.5 py-2.5 text-sm gap-3'
  if (props.iconOnly) {
    const map = { xs: 'p-1', sm: 'p-1.5', md: 'p-2', lg: 'p-2.5', xl: 'p-3' }
    return map[props.size] || map.md
  }
  const map = {
    xs: 'px-2 py-1 text-xs gap-1',
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2',
    xl: 'px-6 py-3 text-base gap-2.5',
  }
  return map[props.size] || map.md
})

// ── Shape classes ─────────────────────────────────────────
const shapeClasses = computed(() => {
  if (isInlineVariant.value) return ''
  const map = { round: 'rounded-lg', pill: 'rounded-full', square: 'rounded-none', circle: 'rounded-full', none: '' }
  return map[props.shape] || map.round
})

// ── Colour × Variant classes ──────────────────────────────
const colorVariantClasses = computed(() => {
  const v = props.variant
  const c = props.color

  // Menu item — no bg, no rounding, consistent hover. Defaults to gray text.
  if (v === 'menu-item') {
    const effectiveColor = c === 'primary' ? 'gray' : c
    const map = {
      gray:    'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
      red:     'text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30',
      green:   'text-success-600 dark:text-success-400 hover:bg-gray-100 dark:hover:bg-gray-700',
      amber:   'text-amber-600 dark:text-amber-400 hover:bg-gray-100 dark:hover:bg-gray-700',
      white:   'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
    }
    return map[effectiveColor] || map.gray
  }

  // List item — settings list rows. Defaults to gray text.
  if (v === 'list-item') {
    const effectiveColor = c === 'primary' ? 'gray' : c
    const map = {
      gray:    'text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700/50',
      red:     'text-red-600 dark:text-red-400 hover:bg-red-200/50 dark:hover:bg-red-800/30',
      green:   'text-success-600 dark:text-success-400 hover:bg-gray-200/70 dark:hover:bg-gray-700/50',
      amber:   'text-amber-600 dark:text-amber-400 hover:bg-gray-200/70 dark:hover:bg-gray-700/50',
      white:   'text-gray-700 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-700/50',
    }
    return map[effectiveColor] || map.gray
  }

  // Solid
  if (v === 'solid') {
    const map = {
      primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md',
      gray:    'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
      red:     'bg-red-600 hover:bg-red-700 text-white shadow-sm hover:shadow-md',
      green:   'bg-success-600 hover:bg-success-700 text-white shadow-sm hover:shadow-md',
      amber:   'bg-amber-600 hover:bg-amber-700 text-white shadow-sm hover:shadow-md',
      white:   'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200 shadow-sm',
    }
    return map[c] || map.primary
  }

  // Outline
  if (v === 'outline') {
    const map = {
      primary: 'border border-primary-500 text-primary-600 dark:text-primary-400 bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/20',
      gray:    'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
      red:     'border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20',
      green:   'border border-success-300 dark:border-success-700 text-success-600 dark:text-success-400 bg-transparent hover:bg-success-50 dark:hover:bg-success-900/20',
      amber:   'border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 bg-transparent hover:bg-amber-50 dark:hover:bg-amber-900/20',
      white:   'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
    }
    return map[c] || map.primary
  }

  // Dashed
  if (v === 'dashed') {
    const map = {
      primary: 'border border-dashed border-primary-400 dark:border-primary-600 text-primary-600 dark:text-primary-400 bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/20',
      gray:    'border border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
      red:     'border border-dashed border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20',
      green:   'border border-dashed border-success-300 dark:border-success-700 text-success-600 dark:text-success-400 bg-transparent hover:bg-success-50 dark:hover:bg-success-900/20',
      amber:   'border border-dashed border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 bg-transparent hover:bg-amber-50 dark:hover:bg-amber-900/20',
      white:   'border border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-700',
    }
    return map[c] || map.primary
  }

  // Ghost
  if (v === 'ghost') {
    const map = {
      primary: 'text-primary-600 dark:text-primary-400 bg-transparent hover:bg-primary-50 dark:hover:bg-primary-900/20',
      gray:    'text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
      red:     'text-red-600 dark:text-red-400 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20',
      green:   'text-success-600 dark:text-success-400 bg-transparent hover:bg-success-50 dark:hover:bg-success-900/20',
      amber:   'text-amber-600 dark:text-amber-400 bg-transparent hover:bg-amber-50 dark:hover:bg-amber-900/20',
      white:   'text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700',
    }
    return map[c] || map.primary
  }

  // Text
  if (v === 'text') {
    const map = {
      primary: 'text-primary-600 dark:text-primary-400 bg-transparent hover:underline',
      gray:    'text-gray-600 dark:text-gray-400 bg-transparent hover:underline',
      red:     'text-red-600 dark:text-red-400 bg-transparent hover:underline',
      green:   'text-success-600 dark:text-success-400 bg-transparent hover:underline',
      amber:   'text-amber-600 dark:text-amber-400 bg-transparent hover:underline',
      white:   'text-gray-700 dark:text-gray-300 bg-transparent hover:underline',
    }
    return map[c] || map.primary
  }

  // Link
  if (v === 'link') {
    const map = {
      primary: 'text-primary-600 dark:text-primary-400 hover:underline p-0',
      gray:    'text-gray-500 dark:text-gray-400 hover:underline p-0',
      red:     'text-red-600 dark:text-red-400 hover:underline p-0',
      green:   'text-success-600 dark:text-success-400 hover:underline p-0',
      amber:   'text-amber-600 dark:text-amber-400 hover:underline p-0',
      white:   'text-gray-700 dark:text-gray-300 hover:underline p-0',
    }
    return map[c] || map.primary
  }

  return ''
})

// ── Disabled / loading classes ────────────────────────────
const stateClasses = computed(() => {
  if (props.disabled || props.loading) {
    return 'opacity-50 cursor-not-allowed pointer-events-none'
  }
  return 'cursor-pointer'
})

// ── Merge with external classes (external wins) ──────────
const attrs = useAttrs()

const restAttrs = computed(() => {
  const { class: _, ...rest } = attrs
  return rest
})

const mergedClasses = computed(() => {
  const externalClass = attrs.class || ''
  return twMerge(internalClasses.value, externalClass)
})

// ── Assembled internal classes ────────────────────────────
const internalClasses = computed(() => {
  const base = 'inline-flex items-center transition-colors select-none'
  const justify = isInlineVariant.value ? '' : 'justify-center'
  const blockClass = (props.block || isInlineVariant.value) ? 'w-full' : ''
  const weight = ['ghost', 'text', 'link', 'menu-item', 'list-item'].includes(props.variant) ? '' : 'font-medium'
  return [
    base,
    justify,
    weight,
    sizeClasses.value,
    shapeClasses.value,
    colorVariantClasses.value,
    stateClasses.value,
    blockClass,
  ].filter(Boolean).join(' ')
})
</script>
