<template>
  <div
    @click="handleClick"
    class="p-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-850 transition-colors"
    :class="{
      'bg-white dark:bg-gray-925 border-l-4 border-l-primary-500': active && !selectMode,
      'bg-primary-50 dark:bg-primary-900/20': selectMode && selected
    }">
    <div class="flex items-start justify-between gap-2">
      <!-- Animated checkbox for select mode -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-0 w-0 mr-0"
        enter-to-class="opacity-100 scale-100 w-5 mr-1"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 scale-100 w-5 mr-1"
        leave-to-class="opacity-0 scale-0 w-0 mr-0">
        <div v-if="selectMode" class="flex-shrink-0 pt-0.5 mr-1" @click.stop="$emit('toggle-select', note.id)">
          <div class="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150"
            :class="selected
              ? 'bg-primary-600 border-primary-600 scale-110'
              : 'border-gray-300 dark:border-gray-600 scale-100'">
            <Transition
              enter-active-class="transition-all duration-150 ease-out"
              enter-from-class="opacity-0 scale-0"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition-all duration-100 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-0">
              <Icon v-if="selected" name="mdi:check" class="w-3.5 h-3.5 text-white" />
            </Transition>
          </div>
        </div>
      </Transition>

      <div class="flex-1 min-w-0">
        <h3 class="font-medium text-gray-900 dark:text-gray-400 truncate">
          {{ note.title || 'Untitled' }}
        </h3>
        <p v-if="note.description" class="text-sm text-gray-600 dark:text-gray-500 truncate mt-1">
          {{ note.description }}
        </p>
        <div v-if="note.tags && note.tags.length" class="flex flex-wrap gap-1 mt-1.5">
          <span v-for="tag in note.tags" :key="tag"
            class="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
            {{ tag }}
          </span>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">
          {{ formatDate(note.updatedAt) }}
        </p>
      </div>
      <button v-if="!selectMode" @click.stop="$emit('delete', note.id)"
        class="p-1 text-gray-400 hover:text-error-600 dark:text-gray-500 dark:hover:text-error-400 transition-colors"
        title="Delete note">
        <Icon name="mdi:trash-can-outline" class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  note: { type: Object, required: true },
  active: { type: Boolean, default: false },
  selectMode: { type: Boolean, default: false },
  selected: { type: Boolean, default: false }
})

const emit = defineEmits(['select', 'delete', 'toggle-select'])

const handleClick = () => {
  if (props.selectMode) {
    emit('toggle-select', props.note.id)
  } else {
    emit('select', props.note.id)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return date.toLocaleDateString()
}
</script>
