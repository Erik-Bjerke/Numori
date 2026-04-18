<template>
  <div>
    <!-- Backdrop -->
    <div v-if="show" class="fixed inset-0" :class="backdropClass" @click="$emit('close')" />

    <!-- Panel -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="show"
        class="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1"
        :class="[widthClass, panelZClass]"
        :style="positionStyle"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup>
const props = defineProps({
  /** Whether the popup is visible */
  show: { type: Boolean, default: false },
  /** X position in px (relative to positioned parent) */
  x: { type: Number, default: 0 },
  /** Y position in px (relative to positioned parent) */
  y: { type: Number, default: 0 },
  /** Y offset added to y (e.g. to push below the click point) */
  offsetY: { type: Number, default: 0 },
  /** Panel width class */
  width: { type: String, default: 'w-56' },
  /** Panel z-index class */
  panelZ: { type: String, default: 'z-50' },
  /** Backdrop z-index class */
  backdropZ: { type: String, default: 'z-40' },
})

defineEmits(['close'])

const widthClass = computed(() => props.width)
const panelZClass = computed(() => props.panelZ)
const backdropClass = computed(() => props.backdropZ)

const positionStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y + props.offsetY}px`,
}))
</script>
