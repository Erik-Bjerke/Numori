<template>
  <Dropdown ref="dropdownRef" width="w-56" @close="onClose">
    <template #trigger="{ toggle }">
      <Button @click="toggle" variant="ghost" color="gray" size="sm" title="File menu">
        <Icon name="mdi:file-document-outline" class="w-4.5 h-4.5 block" />
        <span class="hidden sm:inline text-sm">File</span>
        <Icon name="mdi:chevron-down" class="w-3 h-3 block transition-transform" :class="{ 'rotate-180': dropdownRef?.isOpen }" />
      </Button>
    </template>

    <!-- Create -->
    <DropdownItem icon="mdi:plus" label="New Note" :shortcut="`${modLabel}+⇧+N`" @click="action('new-note')" />
    <DropdownItem icon="mdi:folder-open-outline" label="Open File…" :shortcut="`${modLabel}+O`" @click="action('open-file')" />
    <DropdownItem icon="mdi:content-duplicate" label="Duplicate Note" :shortcut="`${modLabel}+D`" :disabled="!hasNote" @click="action('duplicate')" />

    <div class="border-t border-gray-100 dark:border-gray-700 my-1" />

    <!-- Export sub-menu -->
    <DropdownSubmenu icon="mdi:export" :label="selectionCount > 0 ? `Export Selection (${selectionCount})` : 'Export'" :disabled="!hasNote && selectionCount === 0">
      <DropdownItem icon="mdi:download" :label="selectionCount > 0 ? `Selection as JSON (${selectionCount})` : 'Text (.txt)'" :shortcut="selectionCount > 0 ? '' : `${modLabel}+E`" @click="action('export-text')" />
      <DropdownItem v-if="selectionCount === 0" icon="mdi:language-markdown-outline" label="Markdown (.md)" @click="action('export-markdown')" />
      <DropdownItem v-if="selectionCount === 0" icon="mdi:file-pdf-box" label="PDF" @click="action('export-pdf')" />
    </DropdownSubmenu>

    <DropdownItem icon="mdi:content-copy" label="Copy to Clipboard" :disabled="!hasNote" @click="action('copy')" />
    <DropdownItem icon="mdi:printer" label="Print" :shortcut="`${modLabel}+P`" :disabled="!hasNote" @click="action('print')" />

    <div class="border-t border-gray-100 dark:border-gray-700 my-1" />

    <!-- Backup & restore -->
    <DropdownItem icon="mdi:code-json" :label="selectionCount > 0 ? `Export Selection as JSON (${selectionCount})` : 'Export as JSON'" :disabled="!hasNote && selectionCount === 0" @click="action('export-json')" />
    <DropdownItem icon="mdi:database-export" :label="selectionCount > 0 ? `Export Selection (${selectionCount})` : 'Export All Notes'" :shortcut="selectionCount > 0 ? '' : `${modLabel}+⇧+S`" @click="action('export-all')" />
    <DropdownItem icon="mdi:upload" label="Import Notes…" @click="action('import')" />
  </Dropdown>
</template>

<script setup>
defineProps({
  hasNote: { type: Boolean, default: false },
  modLabel: { type: String, default: 'Ctrl' },
  selectionCount: { type: Number, default: 0 },
})

const emit = defineEmits([
  'new-note', 'open-file', 'duplicate',
  'export-text', 'export-markdown', 'export-pdf',
  'export-json', 'export-all', 'import', 'copy', 'print',
])

const dropdownRef = ref(null)

const action = (name) => {
  dropdownRef.value?.close()
  emit(name)
}

const onClose = () => {}
</script>
