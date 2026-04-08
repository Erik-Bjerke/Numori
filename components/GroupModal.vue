<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="$emit('close')">
        <Transition name="modal-panel" appear>
          <div v-if="isOpen" class="bg-white dark:bg-gray-925 rounded-lg max-w-sm w-full p-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-400 leading-none">
                {{ editingGroupId ? 'Edit Group' : 'New Group' }}
              </h2>
              <button @click="$emit('close')" class="flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <Icon name="mdi:close" class="block w-5 h-5" />
              </button>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Name</label>
                <input v-model="localName" type="text" ref="nameInput"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Group name" @keydown.enter="save" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Internal Name</label>
                <input v-model="localInternalName" type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-500 font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="group_name"
                  @input="internalNameManuallyEdited = true" />
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Auto-generated from name. Edit to customise.</p>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
              <button @click="$emit('close')"
                class="px-4 py-2 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-850 rounded-lg transition-colors">
                Cancel
              </button>
              <button @click="save" :disabled="!localName.trim()"
                class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed">
                {{ editingGroupId ? 'Save' : 'Create' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { normaliseName, uniqueInternalName } from '~/utils/normaliseName.js'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  editingGroupId: { type: String, default: null },
  initialName: { type: String, default: '' },
  initialInternalName: { type: String, default: '' },
  allGroups: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'save'])

const localName = ref('')
const localInternalName = ref('')
const internalNameManuallyEdited = ref(false)
const nameInput = ref(null)

watch(localName, (val) => {
  internalNameManuallyEdited.value = false
  localInternalName.value = uniqueInternalName(val, [], 'new_group', props.editingGroupId, props.allGroups)
})

watch(() => props.isOpen, (open) => {
  if (open) {
    localName.value = props.initialName
    localInternalName.value = props.initialInternalName || uniqueInternalName(props.initialName, [], 'new_group', props.editingGroupId, props.allGroups)
    internalNameManuallyEdited.value = false
    nextTick(() => nameInput.value?.focus())
  }
})

const save = () => {
  if (!localName.value.trim()) return
  const rawName = internalNameManuallyEdited.value
    ? normaliseName(localInternalName.value)
    : localInternalName.value
  const finalInternalName = uniqueInternalName(rawName, [], 'new_group', props.editingGroupId, props.allGroups)
  emit('save', {
    id: props.editingGroupId,
    name: localName.value.trim(),
    internalName: finalInternalName,
  })
  emit('close')
}
</script>

<style scoped>
.modal-backdrop-enter-active, .modal-backdrop-leave-active { transition: opacity 0.2s ease; }
.modal-backdrop-enter-from, .modal-backdrop-leave-to { opacity: 0; }
.modal-panel-enter-active { transition: all 0.2s ease-out; }
.modal-panel-leave-active { transition: all 0.15s ease-in; }
.modal-panel-enter-from, .modal-panel-leave-to { opacity: 0; transform: scale(0.95); }
</style>
