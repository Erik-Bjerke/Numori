<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="$emit('close')">
        <Transition name="modal-panel" appear>
          <div v-if="isOpen" class="bg-white dark:bg-gray-925 rounded-lg max-w-sm w-full p-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-400 leading-none">Delete Group</h2>
              <button @click="$emit('close')" class="flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <Icon name="mdi:close" class="block w-5 h-5" />
              </button>
            </div>

            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              What would you like to do with the <span class="font-medium">{{ noteCount }}</span> note{{ noteCount === 1 ? '' : 's' }} in "<span class="font-medium">{{ groupName }}</span>"?
            </p>

            <div class="space-y-2 mt-4">
              <button @click="$emit('confirm', 'keep')"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                <Icon name="mdi:folder-remove-outline" class="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p class="text-sm font-medium text-gray-800 dark:text-gray-300">Delete group only</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Notes will be moved outside the group</p>
                </div>
              </button>

              <button v-if="otherGroups.length > 0" @click="showMoveOptions = !showMoveOptions"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
                <Icon name="mdi:folder-swap-outline" class="w-5 h-5 text-primary-500 flex-shrink-0" />
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-800 dark:text-gray-300">Move notes to another group</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">Then delete this group</p>
                </div>
                <Icon :name="showMoveOptions ? 'mdi:chevron-up' : 'mdi:chevron-down'" class="w-4 h-4 text-gray-400 flex-shrink-0" />
              </button>

              <div v-if="showMoveOptions" class="pl-8 space-y-1">
                <button v-for="g in otherGroups" :key="g.id"
                  @click="$emit('confirm', 'move', g.id)"
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Icon name="mdi:folder-outline" class="w-4 h-4 text-primary-500 flex-shrink-0" />
                  {{ g.name }}
                </button>
              </div>

              <button @click="$emit('confirm', 'delete-all')"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
                <Icon name="mdi:trash-can-outline" class="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p class="text-sm font-medium text-red-600 dark:text-red-400">Delete group and all notes</p>
                  <p class="text-xs text-red-400 dark:text-red-500">This cannot be undone</p>
                </div>
              </button>
            </div>

            <div class="flex justify-end mt-4">
              <button @click="$emit('close')"
                class="px-4 py-2 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  isOpen: { type: Boolean, default: false },
  groupName: { type: String, default: '' },
  noteCount: { type: Number, default: 0 },
  otherGroups: { type: Array, default: () => [] },
})

defineEmits(['close', 'confirm'])

const showMoveOptions = ref(false)

watch(() => props.isOpen, (open) => {
  if (open) showMoveOptions.value = false
})
</script>

<style scoped>
.modal-backdrop-enter-active, .modal-backdrop-leave-active { transition: opacity 0.2s ease; }
.modal-backdrop-enter-from, .modal-backdrop-leave-to { opacity: 0; }
.modal-panel-enter-active { transition: all 0.2s ease-out; }
.modal-panel-leave-active { transition: all 0.15s ease-in; }
.modal-panel-enter-from, .modal-panel-leave-to { opacity: 0; transform: scale(0.95); }
</style>
