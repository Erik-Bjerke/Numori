<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="$emit('close')">
        <Transition name="modal-panel" appear>
          <div v-if="isOpen" class="bg-white dark:bg-gray-925 rounded-lg max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col">

            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
              <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-400 leading-none">Share Analytics</h2>
              <button @click="$emit('close')" class="flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <Icon name="mdi:close" class="block w-5 h-5" />
              </button>
            </div>

            <!-- Tabs -->
            <div class="flex border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
              <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
                class="flex-1 px-4 py-2.5 text-xs font-medium transition-colors relative"
                :class="activeTab === tab.id
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'">
                {{ tab.label }}
                <div v-if="activeTab === tab.id" class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400" />
              </button>
            </div>

            <!-- Body -->
            <div class="flex-1 overflow-y-auto px-5 py-4">
              <!-- Loading -->
              <div v-if="loading" class="flex items-center justify-center py-12">
                <Icon name="mdi:loading" class="w-6 h-6 text-gray-400 animate-spin" />
              </div>

              <!-- Not enabled -->
              <div v-else-if="data && !data.enabled" class="text-center py-12">
                <Icon name="mdi:chart-bar" class="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p class="text-sm text-gray-500 dark:text-gray-500">Analytics were not enabled for this share</p>
              </div>

              <template v-else-if="data">
                <!-- ═══ Summary Tab ═══ -->
                <div v-if="activeTab === 'summary'" class="space-y-4">
                  <!-- Status badge -->
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      :class="data.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'">
                      <span class="w-1.5 h-1.5 rounded-full" :class="data.isActive ? 'bg-green-500' : 'bg-gray-400'" />
                      {{ data.isActive ? 'Active' : 'Unshared' }}
                    </span>
                  </div>

                  <!-- Stats grid -->
                  <div class="grid grid-cols-2 gap-2">
                    <div class="px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                      <p class="text-lg font-semibold text-gray-900 dark:text-gray-200">{{ data.totalViews }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-500">Total views</p>
                    </div>
                    <div class="px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                      <p class="text-lg font-semibold text-gray-900 dark:text-gray-200">{{ data.totalImports }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-500">Imports</p>
                    </div>
                    <div class="px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                      <p class="text-lg font-semibold text-gray-900 dark:text-gray-200">{{ data.knownViewers }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-500">Known viewers</p>
                    </div>
                    <div class="px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                      <p class="text-lg font-semibold text-gray-900 dark:text-gray-200">{{ data.anonymousViews }}</p>
                      <p class="text-xs text-gray-500 dark:text-gray-500">Anonymous / private</p>
                    </div>
                  </div>

                  <!-- Quick list of recent events -->
                  <div v-if="data.views.length">
                    <p class="text-xs font-medium text-gray-500 dark:text-gray-500 mb-2">Recent activity</p>
                    <div class="space-y-1">
                      <div v-for="v in data.views.slice(0, 5)" :key="v.id"
                        class="flex items-center justify-between text-xs py-1.5 px-2 rounded bg-gray-50 dark:bg-gray-900">
                        <div class="flex items-center gap-1.5 min-w-0">
                          <Icon :name="v.eventType === 'import' ? 'mdi:download' : 'mdi:eye-outline'"
                            class="w-3.5 h-3.5 flex-shrink-0"
                            :class="v.eventType === 'import' ? 'text-primary-500' : 'text-gray-400'" />
                          <span class="text-gray-700 dark:text-gray-300 truncate">{{ v.viewerName || 'Unknown' }}</span>
                          <span v-if="v.parsed" class="text-gray-400 truncate hidden sm:inline">· {{ v.parsed.summary }}</span>
                        </div>
                        <span class="text-gray-400 flex-shrink-0 ml-2">{{ formatTimeAgo(v.viewedAt) }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-6">
                    <Icon name="mdi:eye-off-outline" class="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p class="text-sm text-gray-500 dark:text-gray-500">No activity yet</p>
                  </div>
                </div>

                <!-- ═══ Details Tab ═══ -->
                <div v-if="activeTab === 'details'" class="space-y-3">
                  <!-- Controls -->
                  <div class="flex items-center justify-between">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input v-model="showRaw" type="checkbox"
                        class="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500" />
                      <span class="text-xs text-gray-500 dark:text-gray-500">Show raw data</span>
                    </label>
                    <div class="flex items-center gap-2">
                      <button v-if="selectedIds.size > 0" @click="deleteSelected"
                        class="text-xs px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                        Delete selected ({{ selectedIds.size }})
                      </button>
                      <button v-if="data.views.length > 0" @click="deleteAll"
                        class="text-xs px-2 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                        Delete all
                      </button>
                    </div>
                  </div>

                  <!-- Select all -->
                  <label v-if="data.views.length > 0" class="flex items-center gap-2 cursor-pointer px-1">
                    <input type="checkbox" :checked="selectedIds.size === data.views.length && data.views.length > 0"
                      @change="toggleSelectAll"
                      class="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500" />
                    <span class="text-xs text-gray-500 dark:text-gray-500">Select all</span>
                  </label>

                  <!-- Event list -->
                  <div v-if="data.views.length" class="space-y-2">
                    <div v-for="v in data.views" :key="v.id"
                      class="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <!-- Event header -->
                      <div class="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900">
                        <input type="checkbox" :checked="selectedIds.has(v.id)"
                          @change="toggleSelect(v.id)"
                          class="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500" />
                        <Icon :name="v.eventType === 'import' ? 'mdi:download' : 'mdi:eye-outline'"
                          class="w-4 h-4 flex-shrink-0"
                          :class="v.eventType === 'import' ? 'text-primary-500' : 'text-gray-400'" />
                        <span class="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                          {{ v.viewerName || 'Unknown' }}
                        </span>
                        <span class="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                          :class="v.eventType === 'import'
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'">
                          {{ v.eventType }}
                        </span>
                        <span class="ml-auto text-[10px] text-gray-400 flex-shrink-0">{{ formatTimestamp(v.viewedAt) }}</span>
                      </div>

                      <!-- Parsed details -->
                      <div class="px-3 py-2 space-y-1 text-xs">
                        <div v-if="v.parsed" class="flex flex-wrap gap-x-4 gap-y-1 text-gray-600 dark:text-gray-400">
                          <span><span class="text-gray-400">Device:</span> {{ v.parsed.deviceType }}</span>
                          <span><span class="text-gray-400">OS:</span> {{ v.parsed.os }}{{ v.parsed.osVersion ? ' ' + v.parsed.osVersion : '' }}</span>
                          <span><span class="text-gray-400">Browser:</span> {{ v.parsed.browser }}{{ v.parsed.browserVersion ? ' ' + v.parsed.browserVersion.split('.')[0] : '' }}</span>
                        </div>
                        <div v-if="v.raw.referrer" class="text-gray-500 dark:text-gray-500 truncate">
                          <span class="text-gray-400">From:</span> {{ v.raw.referrer }}
                        </div>
                        <div v-if="v.raw.ip" class="text-gray-500 dark:text-gray-500">
                          <span class="text-gray-400">IP:</span> {{ v.raw.ip }}
                        </div>

                        <!-- Raw data -->
                        <div v-if="showRaw && v.raw.userAgent" class="mt-1 px-2 py-1.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-[10px] text-gray-500 dark:text-gray-500 break-all">
                          {{ v.raw.userAgent }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-6">
                    <Icon name="mdi:database-off-outline" class="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p class="text-sm text-gray-500 dark:text-gray-500">No data collected yet</p>
                  </div>
                </div>
              </template>
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
  hash: { type: String, default: null },
  authHeaders: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close'])

const { apiFetch } = useApi()

const tabs = [
  { id: 'summary', label: 'Summary' },
  { id: 'details', label: 'Details' }
]

const activeTab = ref('summary')
const loading = ref(false)
const data = ref(null)
const showRaw = ref(false)
const selectedIds = ref(new Set())

watch(() => props.isOpen, (open) => {
  if (open && props.hash) {
    activeTab.value = 'summary'
    showRaw.value = false
    selectedIds.value = new Set()
    loadData()
  } else {
    data.value = null
  }
})

const loadData = async () => {
  loading.value = true
  try {
    data.value = await apiFetch(`/api/share/${props.hash}/analytics`, {
      headers: props.authHeaders
    })
  } catch {
    data.value = null
  } finally {
    loading.value = false
  }
}

const toggleSelect = (id) => {
  const s = new Set(selectedIds.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  selectedIds.value = s
}

const toggleSelectAll = () => {
  if (selectedIds.value.size === data.value.views.length) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(data.value.views.map(v => v.id))
  }
}

const deleteSelected = async () => {
  if (!selectedIds.value.size) return
  if (!confirm(`Delete ${selectedIds.value.size} selected record(s)?`)) return
  try {
    await apiFetch(`/api/share/${props.hash}/analytics`, {
      method: 'DELETE',
      headers: props.authHeaders,
      body: { ids: [...selectedIds.value] }
    })
    selectedIds.value = new Set()
    await loadData()
  } catch { /* ignore */ }
}

const deleteAll = async () => {
  if (!confirm('Delete all analytics data for this share? This cannot be undone.')) return
  try {
    await apiFetch(`/api/share/${props.hash}/analytics`, {
      method: 'DELETE',
      headers: props.authHeaders
    })
    selectedIds.value = new Set()
    await loadData()
  } catch { /* ignore */ }
}

const formatTimeAgo = (iso) => {
  const d = new Date(iso)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return d.toLocaleDateString()
}

const formatTimestamp = (iso) => {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<style scoped>
.modal-backdrop-enter-active,
.modal-backdrop-leave-active { transition: opacity 0.2s ease; }
.modal-backdrop-enter-from,
.modal-backdrop-leave-to { opacity: 0; }
.modal-panel-enter-active { transition: all 0.2s ease-out; }
.modal-panel-leave-active { transition: all 0.15s ease-in; }
.modal-panel-enter-from,
.modal-panel-leave-to { opacity: 0; transform: scale(0.95); }
</style>
