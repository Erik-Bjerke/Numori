<template>
  <div class="min-h-screen bg-white dark:bg-gray-925 flex flex-col">
    <!-- Header -->
    <header class="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <div class="max-w-3xl mx-auto flex items-center justify-between">
        <a href="/" class="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
          <Icon name="mdi:arrow-left" class="w-4 h-4" />
          Calc Notes
        </a>
        <span class="text-xs text-gray-500 dark:text-gray-500">Shared Note</span>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <Icon name="mdi:loading" class="w-8 h-8 text-gray-400 animate-spin" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center px-6">
      <div class="text-center space-y-3">
        <Icon name="mdi:alert-circle-outline" class="w-12 h-12 text-gray-400 mx-auto" />
        <p class="text-gray-700 dark:text-gray-400">{{ error }}</p>
        <a href="/"
          class="inline-block px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors">
          Go to Calc Notes
        </a>
      </div>
    </div>

    <!-- Shared note content -->
    <main v-else-if="note" class="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-4">
      <div class="space-y-1">
        <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-200">{{ note.title }}</h1>
        <p v-if="note.description" class="text-sm text-gray-500 dark:text-gray-500">{{ note.description }}</p>
        <div v-if="note.sharer" class="text-xs text-gray-500 dark:text-gray-500">
          Shared by {{ note.sharer.name || note.sharer.email || 'someone' }}
        </div>
        <div v-if="note.tags?.length" class="flex flex-wrap gap-1.5 pt-1">
          <span v-for="tag in note.tags" :key="tag"
            class="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {{ tag }}
          </span>
        </div>
      </div>

      <pre class="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800 overflow-x-auto">{{ note.content }}</pre>

      <!-- Import into own notes -->
      <button @click="importNote"
        class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
        <Icon name="mdi:download" class="w-4 h-4" />
        Import to my notes
      </button>
    </main>
  </div>
</template>

<script setup>
const route = useRoute()
const hash = route.params.hash

const note = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    note.value = await $fetch(`/api/share/${hash}`)
  } catch (err) {
    error.value = err.data?.statusMessage || 'This shared note could not be found.'
  } finally {
    loading.value = false
  }
})

const importNote = () => {
  if (!note.value) return
  // Store in localStorage so the main app picks it up
  const pending = {
    title: note.value.title,
    description: note.value.description || '',
    tags: note.value.tags || [],
    content: note.value.content
  }
  localStorage.setItem('pending_import', JSON.stringify(pending))
  navigateTo('/')
}
</script>
