<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger -->
    <slot name="trigger" :open="isOpen" :toggle="toggle" />

    <!-- Panel -->
    <Transition
      :enter-active-class="transitionClasses.enterActive"
      :enter-from-class="transitionClasses.enterFrom"
      :enter-to-class="transitionClasses.enterTo"
      :leave-active-class="transitionClasses.leaveActive"
      :leave-from-class="transitionClasses.leaveFrom"
      :leave-to-class="transitionClasses.leaveTo"
    >
      <div
        v-show="isOpen"
        :class="panelClasses"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
const props = defineProps({
  /** Panel width class, e.g. 'w-48', 'w-56' */
  width: { type: String, default: 'w-56' },
  /** Horizontal alignment: 'left' or 'right' */
  align: { type: String, default: 'left' },
  /** Drop direction: 'down' or 'up' */
  drop: { type: String, default: 'down' },
  /** Override all panel classes (skips default bg/border/rounded/shadow) */
  panelClass: { type: String, default: '' },
})

const emit = defineEmits(['open', 'close'])

const isOpen = ref(false)
const containerRef = ref(null)

const panelClasses = computed(() => {
  if (props.panelClass) return props.panelClass
  const align = props.align === 'right' ? 'right-0' : 'left-0'
  const dropDir = props.drop === 'up' ? 'bottom-full mb-1' : 'mt-1'
  return `absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 ${props.width} ${align} ${dropDir}`
})

const transitionClasses = computed(() => {
  if (props.drop === 'up') {
    return {
      enterActive: 'transition ease-out duration-150',
      enterFrom: 'opacity-0 translate-y-1',
      enterTo: 'opacity-100 translate-y-0',
      leaveActive: 'transition ease-in duration-100',
      leaveFrom: 'opacity-100 translate-y-0',
      leaveTo: 'opacity-0 translate-y-1',
    }
  }
  return {
    enterActive: 'transition duration-100 ease-out',
    enterFrom: 'opacity-0 scale-95',
    enterTo: 'opacity-100 scale-100',
    leaveActive: 'transition duration-75 ease-in',
    leaveFrom: 'opacity-100 scale-100',
    leaveTo: 'opacity-0 scale-95',
  }
})

const toggle = () => {
  isOpen.value = !isOpen.value
  emit(isOpen.value ? 'open' : 'close')
}

const close = () => {
  if (isOpen.value) {
    isOpen.value = false
    emit('close')
  }
}

onClickOutside(containerRef, close)

useEventListener(document, 'keydown', (e) => {
  if (e.key === 'Escape') close()
})

defineExpose({ isOpen, toggle, close })
</script>
