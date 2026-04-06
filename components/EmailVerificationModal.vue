<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="$emit('close')">
        <Transition name="modal-panel" appear>
          <div v-if="isOpen" class="bg-white dark:bg-gray-925 rounded-lg max-w-sm w-full p-5">

            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-400 leading-none">Verify Email</h2>
              <button @click="$emit('close')" class="flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <Icon name="mdi:close" class="block w-5 h-5" />
              </button>
            </div>

            <p class="text-xs text-gray-500 dark:text-gray-500 mb-4">
              Enter the 6-digit code sent to your email address.
            </p>

            <div v-if="error" class="mb-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs">
              {{ error }}
            </div>

            <div v-if="success" class="mb-3 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs">
              {{ success }}
            </div>

            <form @submit.prevent="handleVerify" class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Verification Code</label>
                <input v-model="code" type="text" required inputmode="numeric" maxlength="6" pattern="[0-9]{6}"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm text-center tracking-[0.3em] text-lg font-mono"
                  placeholder="000000" />
              </div>
              <button type="submit" :disabled="loading || code.length !== 6"
                class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                <Icon v-if="loading" name="mdi:loading" class="w-4 h-4 animate-spin" />
                Verify
              </button>
            </form>

            <p class="text-center text-xs text-gray-500 dark:text-gray-500 mt-3">
              Didn't receive a code?
              <button @click="handleResend" :disabled="loading || resendCooldown > 0"
                class="text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50 disabled:no-underline">
                {{ resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend code' }}
              </button>
            </p>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  isOpen: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null }
})

const emit = defineEmits(['close', 'verify', 'resend'])

const code = ref('')
const success = ref(null)
const resendCooldown = ref(0)
let cooldownTimer = null

watch(() => props.isOpen, (open) => {
  if (open) {
    code.value = ''
    success.value = null
  }
})

const handleVerify = () => {
  emit('verify', code.value)
}

const handleResend = () => {
  emit('resend')
  success.value = 'A new code has been sent to your email.'
  resendCooldown.value = 60
  clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}

onBeforeUnmount(() => clearInterval(cooldownTimer))
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
