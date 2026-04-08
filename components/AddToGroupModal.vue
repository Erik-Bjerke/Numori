<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="$emit('close')">
        <Transition name="modal-panel" appear>
          <div v-if="isOpen" class="bg-white dark:bg-gray-925 rounded-lg max-w-sm w-full p-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-400 leading-none">Add to Group</h2>
              <button @click="$emit('close')" class="flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <Icon name="mdi:close" class="block w-5 h-5" />
              </button>
            </div>

            <div class="space-y-1 max-h-60 overflow-y-auto">
              <!-- Create new group option -->
              <button @click="$emit('create-new')"
                class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                <Icon name="mdi:folder-plus-outline" class="w-4.5 h-4.5 flex-shrink-0" />
                Create new group
              </button>

              <div v-if="groups.length" class="my-2 border-t border-gray-200 dark:border-gray-700" />

              <!-- Existing groups -->
              <button v-for="group in groups" :key="group.id"
                @click="$emit('select', group.id)"
                class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors"
                :class="currentGroupId === group.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'">
                <Icon name="mdi:folder-outline" class="w-4.5 h-4.5 flex-shrink-0"
                  :class="currentGroupId === group.id ? 'text-primary-500' : 'text-gray-400'" />
                <span class="truncate">{{ group.name }}</span>
                <Icon v-if="currentGroupId === group.id" name="mdi:check" class="w-4 h-4 ml-auto text-primary-500 flex-shrink-0" />
              </button>

              <!-- Remove from group option -->
              <template v-if="currentGroupId">
                <div class="my-2 border-t border-gray-200 dark:border-gray-700" />
                <button @click="$emit('select', null)"
                  class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Icon name="mdi:folder-remove-outline" class="w-4.5 h-4.5 flex-shrink-0" />
                  Remove from group
                </button>
              </template>
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
defineProps({
  isOpen: { type: Boolean, default: false },
  groups: { type: Array, default: () => [] },
  currentGroupId: { type: String, default: null },
})

defineEmits(['close', 'select', 'create-new'])
</script>

<style scoped>
.modal-backdrop-enter-active, .modal-backdrop-leave-active { transition: opacity 0.2s ease; }
.modal-backdrop-enter-from, .modal-backdrop-leave-to { opacity: 0; }
.modal-panel-enter-active { transition: all 0.2s ease-out; }
.modal-panel-leave-active { transition: all 0.15s ease-in; }
.modal-panel-enter-from, .modal-panel-leave-to { opacity: 0; transform: scale(0.95); }
</style>
