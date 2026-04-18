<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger button -->
    <button
      type="button"
      :disabled="disabled || loading"
      :aria-label="ariaLabel"
      :class="[triggerClasses, (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '']"
      @click="toggleOpen"
    >
      <span v-if="loading" class="flex items-center gap-2 truncate text-gray-400 dark:text-gray-500">
        <Icon :name="spinner" class="w-4 h-4 animate-spin flex-shrink-0" />
        <span>{{ loadingText }}</span>
      </span>
      <template v-else>
        <span class="flex items-center gap-2 truncate" :class="selectedLabel ? '' : 'text-gray-400 dark:text-gray-500'">
          <Icon v-if="selectedIcon" :name="selectedIcon" class="w-4 h-4 flex-shrink-0" />
          {{ selectedLabel || placeholder || 'Select...' }}
        </span>
      </template>
      <Icon name="mdi:chevron-down" class="w-4 h-4 flex-shrink-0 text-gray-400 transition-transform"
        :class="{ 'rotate-180': isOpen }" />
    </button>

    <!-- Dropdown panel -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-show="isOpen"
        class="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
        :class="dropUp ? 'bottom-full mb-1 mt-0' : ''">
        <!-- Search input -->
        <div v-if="searchable" class="p-1.5">
          <input
            ref="searchRef"
            v-model="searchQuery"
            type="text"
            placeholder="Search..."
            class="w-full px-2.5 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-300 outline-none focus:ring-1 focus:ring-primary-500 placeholder-gray-400"
            @keydown.escape="close"
            @keydown.enter.prevent="selectFirst"
          />
        </div>
        <!-- Options list -->
        <ul class="max-h-48 overflow-y-auto py-1">
          <li v-if="filteredOptions.length === 0 && filteredGroups.length === 0"
            class="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">
            No results
          </li>

          <!-- Ungrouped options -->
          <template v-if="filteredGroups.length === 0">
            <li
              v-for="opt in filteredOptions"
              :key="opt.value"
              @click="select(opt.value)"
              class="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer transition-colors"
              :class="optionClass(opt.value)"
            >
              <Icon v-if="opt.icon" :name="opt.icon" class="w-4 h-4 flex-shrink-0" />
              <span class="truncate">{{ opt.label }}</span>
            </li>
          </template>

          <!-- Grouped options -->
          <template v-else>
            <template v-for="group in filteredGroups" :key="group.label">
              <li class="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 select-none">
                {{ group.label }}
              </li>
              <li
                v-for="opt in group.options"
                :key="opt.value"
                @click="select(opt.value)"
                class="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer transition-colors"
                :class="optionClass(opt.value)"
              >
                <Icon v-if="opt.icon" :name="opt.icon" class="w-4 h-4 flex-shrink-0" />
                <span class="truncate">{{ opt.label }}</span>
              </li>
            </template>
          </template>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const props = defineProps({
  /** Selected value (v-model) */
  modelValue: { type: [String, Number, Boolean, null], default: '' },
  /**
   * Options array. Each item can be:
   * - A string/number (used as both value and label)
   * - { value, label, icon?, group? }
   */
  options: { type: Array, default: () => [] },
  /** Placeholder text */
  placeholder: { type: String, default: '' },
  /** Enable search filtering */
  searchable: { type: Boolean, default: false },
  /** Disabled state */
  disabled: { type: Boolean, default: false },
  /** Size: 'xs' | 'sm' | 'md' */
  size: { type: String, default: 'md' },
  /** Full width */
  block: { type: Boolean, default: true },
  /** Accessibility label */
  ariaLabel: { type: String, default: undefined },
  /** Loading state — shows spinner, disables interaction */
  loading: { type: Boolean, default: false },
  /** Loading text shown next to spinner */
  loadingText: { type: String, default: 'Loading...' },
  /** Spinner icon name */
  spinner: { type: String, default: 'mdi:loading' },
})

const emit = defineEmits(['update:modelValue'])

const containerRef = ref(null)
const searchRef = ref(null)
const isOpen = ref(false)
const searchQuery = ref('')
const dropUp = ref(false)

// ── Normalize options ────────────────────────────────────
const normalizedOptions = computed(() =>
  props.options.map(opt =>
    typeof opt === 'object' && opt !== null
      ? { value: opt.value, label: opt.label ?? String(opt.value), icon: opt.icon || '', group: opt.group || '' }
      : { value: opt, label: String(opt), icon: '', group: '' }
  )
)

// ── Filtering ────────────────────────────────────────────
const filteredNormalized = computed(() => {
  if (!searchQuery.value) return normalizedOptions.value
  const q = searchQuery.value.toLowerCase()
  return normalizedOptions.value.filter(opt => opt.label.toLowerCase().includes(q))
})

// ── Grouping ─────────────────────────────────────────────
const hasGroups = computed(() => normalizedOptions.value.some(o => o.group))

const filteredGroups = computed(() => {
  if (!hasGroups.value) return []
  const map = new Map()
  for (const opt of filteredNormalized.value) {
    const key = opt.group || ''
    if (!map.has(key)) map.set(key, { label: key, options: [] })
    map.get(key).options.push(opt)
  }
  return [...map.values()].filter(g => g.options.length > 0)
})

const filteredOptions = computed(() => {
  if (hasGroups.value) return []
  return filteredNormalized.value
})

// ── Selected display ─────────────────────────────────────
const selectedOpt = computed(() => normalizedOptions.value.find(o => o.value === props.modelValue))
const selectedLabel = computed(() => selectedOpt.value?.label || '')
const selectedIcon = computed(() => selectedOpt.value?.icon || '')

// ── Styling ──────────────────────────────────────────────
const triggerClasses = computed(() => {
  const base = 'flex items-center justify-between gap-2 text-left border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-400 outline-none transition-colors focus:ring-2 focus:ring-primary-500 focus:border-primary-500'
  const width = props.block ? 'w-full' : ''
  const sizeMap = {
    xs: 'px-2.5 py-1.5 text-xs rounded-md border-gray-200 dark:border-gray-700',
    sm: 'px-2 py-1 text-sm rounded-lg border-gray-300 dark:border-gray-600',
    md: 'px-3 py-2 text-sm rounded-lg border-gray-300 dark:border-gray-700',
  }
  return `${base} ${width} ${sizeMap[props.size] || sizeMap.md}`
})

const optionClass = (value) =>
  props.modelValue === value
    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'

// ── Interactions ─────────────────────────────────────────
const toggleOpen = () => {
  if (props.disabled || props.loading) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    nextTick(() => {
      if (containerRef.value) {
        const rect = containerRef.value.getBoundingClientRect()
        dropUp.value = rect.bottom + 220 > window.innerHeight
      }
      if (props.searchable) searchRef.value?.focus()
    })
  }
}

const select = (value) => {
  emit('update:modelValue', value)
  close()
}

const selectFirst = () => {
  const pool = hasGroups.value
    ? filteredGroups.value.flatMap(g => g.options)
    : filteredOptions.value
  if (pool.length) select(pool[0].value)
}

const close = () => {
  isOpen.value = false
  searchQuery.value = ''
}

onClickOutside(containerRef, close)
</script>
