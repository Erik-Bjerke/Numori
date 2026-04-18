<template>
  <div class="w-full">
    <div class="relative flex">

      <!-- Number: minus button on left (both-sides mode) -->
      <button v-if="isNumber && stepperLayout === 'both-sides'" type="button" tabindex="-1"
        class="flex items-center justify-center w-9 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none"
        :class="{ 'opacity-50 pointer-events-none': disabled }"
        @click="stepDown" aria-label="Decrease value">
        <Icon name="mdi:minus" class="w-4 h-4" />
      </button>

      <!-- Number: stacked buttons on left -->
      <div v-if="isNumber && stepperLayout === 'stacked-left'"
        class="flex flex-col w-6 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg overflow-hidden"
        :class="{ 'opacity-50 pointer-events-none': disabled }">
        <button type="button" tabindex="-1"
          class="grid place-items-center w-4 flex-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none border-b border-gray-300 dark:border-gray-600"
          @click="stepUp" aria-label="Increase value">
          <Icon name="mdi:chevron-up" class="block w-3 h-3" />
        </button>
        <button type="button" tabindex="-1"
          class="grid place-items-center w-4 flex-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none"
          @click="stepDown" aria-label="Decrease value">
          <Icon name="mdi:chevron-down" class="block w-3 h-3" />
        </button>
      </div>

      <!-- The actual input -->
      <input
        ref="inputRef"
        :type="computedType"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :minlength="minlength"
        :maxlength="maxlength"
        :inputmode="computedInputMode"
        :min="min"
        :max="max"
        :step="step"
        :pattern="pattern"
        class="w-full py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm transition-colors"
        :class="inputClasses"
        @input="onInput"
        @blur="onBlur"
        @keydown="onKeydown"
      />

      <!-- Password toggle -->
      <button v-if="isPassword && showToggle" type="button" tabindex="-1"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
        @click="passwordVisible = !passwordVisible">
        <Icon :name="passwordVisible ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" class="w-4 h-4" />
      </button>

      <!-- Number: stacked buttons on right -->
      <div v-if="isNumber && stepperLayout === 'stacked-right'"
        class="flex flex-col w-6 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-lg overflow-hidden"
        :class="{ 'opacity-50 pointer-events-none': disabled }">
        <button type="button" tabindex="-1"
          class="grid place-items-center w-4 flex-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none border-b border-gray-300 dark:border-gray-600"
          @click="stepUp" aria-label="Increase value">
          <Icon name="mdi:chevron-up" class="block w-3 h-3" />
        </button>
        <button type="button" tabindex="-1"
          class="grid place-items-center w-4 flex-1 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none"
          @click="stepDown" aria-label="Decrease value">
          <Icon name="mdi:chevron-down" class="block w-3 h-3" />
        </button>
      </div>

      <!-- Number: plus button on right (both-sides mode) -->
      <button v-if="isNumber && stepperLayout === 'both-sides'" type="button" tabindex="-1"
        class="flex items-center justify-center w-9 rounded-r-lg border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors select-none"
        :class="{ 'opacity-50 pointer-events-none': disabled }"
        @click="stepUp" aria-label="Increase value">
        <Icon name="mdi:plus" class="w-4 h-4" />
      </button>
    </div>

    <!-- Validation error -->
    <p v-if="showError && validationError" class="text-xs text-red-600 dark:text-red-400 mt-1">
      {{ validationError }}
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  autocomplete: { type: String, default: undefined },
  minlength: { type: Number, default: undefined },
  maxlength: { type: Number, default: undefined },
  pattern: { type: String, default: undefined },

  // Password
  showToggle: { type: Boolean, default: true },

  // Number
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined },
  step: { type: Number, default: 1 },
  /** 'stacked-left' | 'stacked-right' | 'both-sides' | 'none' */
  stepperLayout: { type: String, default: 'both-sides' },

  // Validation
  /** Show validation error below the input (on blur) */
  validate: { type: Boolean, default: true },
  /** Custom regex string — overrides built-in patterns */
  validationPattern: { type: String, default: undefined },
  /** Custom error message */
  validationMessage: { type: String, default: undefined },
})

const emit = defineEmits(['update:modelValue', 'validation'])

const inputRef = ref(null)
const passwordVisible = ref(false)
const touched = ref(false)

// --- Computed helpers ---

const isPassword = computed(() => props.type === 'password')
const isNumber = computed(() => props.type === 'number')

const computedType = computed(() => {
  if (isPassword.value) return passwordVisible.value ? 'text' : 'password'
  if (isNumber.value) return 'text' // we handle number filtering ourselves
  if (props.type === 'phone') return 'tel'
  return props.type
})

const computedInputMode = computed(() => {
  if (isNumber.value) return 'decimal'
  if (props.type === 'phone') return 'tel'
  if (props.type === 'email') return 'email'
  return undefined
})

const hasStepper = computed(() => isNumber.value && props.stepperLayout !== 'none')

const inputClasses = computed(() => {
  const classes = []

  // Horizontal padding — tighter when steppers are present
  if (hasStepper.value) {
    classes.push('px-1.5')
  } else {
    classes.push('px-3')
  }

  // Rounding based on stepper layout
  if (hasStepper.value) {
    if (props.stepperLayout === 'both-sides') classes.push('rounded-none')
    else if (props.stepperLayout === 'stacked-left') classes.push('rounded-l-none', 'rounded-r-lg')
    else if (props.stepperLayout === 'stacked-right') classes.push('rounded-r-none', 'rounded-l-lg')
  } else {
    classes.push('rounded-lg')
  }

  // Extra right padding for password toggle
  if (isPassword.value && props.showToggle) classes.push('pr-10')

  // Number text alignment
  if (isNumber.value && hasStepper.value) classes.push('text-center')

  return classes
})

// --- Validation ---

const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-().]{7,}$/,
  number: /^-?\d*\.?\d+$/,
}

const MESSAGES = {
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  number: 'Please enter a valid number',
}

const validationError = computed(() => {
  const val = String(props.modelValue ?? '')
  if (!val) return null

  // Custom pattern takes priority
  if (props.validationPattern) {
    const re = new RegExp(props.validationPattern)
    if (!re.test(val)) return props.validationMessage || 'Invalid format'
  }

  // Built-in patterns
  const builtIn = PATTERNS[props.type]
  if (builtIn && !builtIn.test(val)) {
    return props.validationMessage || MESSAGES[props.type] || 'Invalid input'
  }

  return null
})

const showError = computed(() => props.validate && touched.value)

watch(validationError, (err) => {
  emit('validation', { valid: !err, error: err })
})

// --- Event handlers ---

const NUMBER_ALLOWED = /^-?\d*\.?\d*$/

function onInput(e) {
  let val = e.target.value

  // For number type, reject non-numeric characters
  if (isNumber.value) {
    if (!NUMBER_ALLOWED.test(val)) {
      // Revert to previous valid value
      e.target.value = String(props.modelValue ?? '')
      return
    }
  }

  emit('update:modelValue', isNumber.value && val !== '' && val !== '-' && val !== '.' && val !== '-.' ? Number(val) : val)
}

function onBlur() {
  touched.value = true
}

function onKeydown(e) {
  if (!isNumber.value) return

  // Allow: backspace, delete, tab, escape, enter, arrows, home, end, decimal point, minus
  const allowed = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (allowed.includes(e.key)) return
  if (e.key === '.' && !String(props.modelValue).includes('.')) return
  if (e.key === '-' && e.target.selectionStart === 0 && !String(props.modelValue).includes('-')) return
  if (e.ctrlKey || e.metaKey) return // allow copy/paste/select-all

  // Block non-digit keys
  if (!/^\d$/.test(e.key)) {
    e.preventDefault()
  }
}

function stepUp() {
  const current = Number(props.modelValue) || 0
  let next = current + (props.step ?? 1)
  if (props.max !== undefined) next = Math.min(next, props.max)
  emit('update:modelValue', next)
}

function stepDown() {
  const current = Number(props.modelValue) || 0
  let next = current - (props.step ?? 1)
  if (props.min !== undefined) next = Math.max(next, props.min)
  emit('update:modelValue', next)
}

// Expose focus method
defineExpose({
  focus: () => inputRef.value?.focus(),
  el: inputRef,
})
</script>

