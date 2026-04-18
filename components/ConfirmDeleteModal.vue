<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="$emit('close')">
        <Transition name="modal-panel" appear>
          <div v-if="isOpen" class="bg-white dark:bg-gray-925 rounded-lg max-w-sm w-full p-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-400 leading-none">
                Delete Note
              </h2>
              <UiButton variant="ghost" color="gray" icon-only @click="$emit('close')">
                <Icon name="mdi:close" class="block w-5 h-5" />
              </UiButton>
            </div>

            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete this note?
            </p>

            <div class="flex justify-end gap-2">
              <UiButton variant="ghost" color="gray" @click="$emit('close')">
                Cancel
              </UiButton>
              <UiButton color="red" @click="$emit('confirm')">
                Delete
              </UiButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close', 'confirm'])
</script>
