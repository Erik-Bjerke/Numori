<template>
  <div class="flex flex-wrap items-center gap-1 sm:flex-nowrap">
    <!-- View toggles -->
    <div class="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-start">
      <div class="inline-flex items-center bg-gray-200/50 dark:bg-gray-800 rounded-lg" role="group">
        <Button @click="$emit('update:renderMarkdown', true)" variant="ghost" icon-only
          :class="renderMarkdown
            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'"
          title="Render Markdown">
          <Icon name="mdi:language-markdown" class="w-4.5 h-4.5 block" />
        </Button>
        <Button @click="$emit('update:renderMarkdown', false)" variant="ghost" icon-only
          :class="!renderMarkdown
            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'"
          title="Raw text">
          <Icon name="mdi:format-text" class="w-4.5 h-4.5 block" />
        </Button>
      </div>

      <div class="inline-flex items-center bg-gray-200/50 dark:bg-gray-800 rounded-lg" role="group">
        <Button @click="$emit('update:resultsPosition', 'left')" variant="ghost" icon-only
          :class="resultsPosition === 'left'
            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'"
          title="Results on left">
          <Icon name="mdi:dock-left" class="w-4.5 h-4.5 block" />
        </Button>
        <Button @click="$emit('update:resultsPosition', 'off')" variant="ghost" icon-only
          :class="resultsPosition === 'off'
            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'"
          title="Results off">
          <Icon name="mdi:eye-off-outline" class="w-4.5 h-4.5 block" />
        </Button>
        <Button @click="$emit('update:resultsPosition', 'right')" variant="ghost" icon-only
          :class="resultsPosition === 'right'
            ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
            : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'"
          title="Results on right">
          <Icon name="mdi:dock-right" class="w-4.5 h-4.5 block" />
        </Button>
      </div>
    </div>

    <!-- Spacer / line break on mobile -->
    <div class="flex-1 basis-full sm:basis-0"></div>

    <!-- Actions: Copy · Export · Print · Import -->
    <div class="flex items-center justify-between sm:justify-end gap-0.5 w-full sm:w-auto">
      <Button @click="handleCopy" variant="ghost" color="gray" size="sm"
        :title="copied ? 'Copied!' : 'Copy to clipboard'">
        <Icon :name="copied ? 'mdi:check' : 'mdi:content-copy'" class="w-3.5 h-3.5 sm:w-4 sm:h-4 block" :class="copied ? 'text-green-500' : ''" />
        <span>{{ copied ? 'Copied' : 'Copy' }}</span>
      </Button>

      <div class="w-px h-4 bg-gray-300/60 dark:bg-gray-700"></div>

      <Dropdown ref="exportDropdownRef" width="w-52" align="right" :drop="dropUp ? 'up' : 'down'">
        <template #trigger="{ toggle }">
          <Button @click="toggle" variant="ghost" color="gray" size="sm" title="Export note">
            <Icon name="mdi:export" class="w-3.5 h-3.5 sm:w-4 sm:h-4 block" />
            <span>Export</span>
            <Icon name="mdi:chevron-down" class="w-3 h-3 block transition-transform" :class="{ 'rotate-180': exportDropdownRef?.isOpen }" />
          </Button>
        </template>

        <Button @click="emitExport('text')" variant="menu-item">
          <Icon name="mdi:file-document-outline" class="w-4 h-4 block flex-shrink-0" />
          <span>Text (.txt)</span>
        </Button>
        <Button @click="emitExport('markdown')" variant="menu-item">
          <Icon name="mdi:language-markdown-outline" class="w-4 h-4 block flex-shrink-0" />
          <span>Markdown (.md)</span>
        </Button>
        <Button @click="emitExport('pdf')" variant="menu-item">
          <Icon name="mdi:file-pdf-box" class="w-4 h-4 block flex-shrink-0" />
          <span>PDF</span>
        </Button>
        <div class="border-t border-gray-100 dark:border-gray-700 my-1" />
        <Button @click="emitExport('json')" variant="menu-item">
          <Icon name="mdi:code-json" class="w-4 h-4 block flex-shrink-0" />
          <span>Export as JSON</span>
        </Button>
      </Dropdown>

      <Button @click="$emit('print')" variant="ghost" color="gray" size="sm"
        title="Print">
        <Icon name="mdi:printer" class="w-3.5 h-3.5 sm:w-4 sm:h-4 block" />
        <span>Print</span>
      </Button>

      <div class="w-px h-4 bg-gray-300/60 dark:bg-gray-700"></div>

      <Button @click="$emit('import')" variant="ghost" color="primary" size="sm"
        title="Import to my notes">
        <Icon name="mdi:note-plus-outline" class="w-3.5 h-3.5 sm:w-4 sm:h-4 block" />
        <span>Import</span>
      </Button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  renderMarkdown: { type: Boolean, default: true },
  resultsPosition: { type: String, default: 'left' },
  copied: { type: Boolean, default: false },
  dropUp: { type: Boolean, default: false },
})

const emit = defineEmits([
  'update:renderMarkdown',
  'update:resultsPosition',
  'copy',
  'export',
  'print',
  'import',
])

const showExportMenu = ref(false)
const exportDropdownRef = ref(null)

const handleCopy = () => emit('copy')

const emitExport = (format) => {
  exportDropdownRef.value?.close()
  emit('export', format)
}
</script>
