<template>
  <Teleport to="body">
    <Transition name="modal-backdrop">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        @click.self="$emit('close')">
        <Transition name="modal-panel" appear>
          <div v-if="isOpen" class="bg-white dark:bg-gray-925 rounded-lg max-w-sm w-full p-5">

            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-400 leading-none">
                {{ headerTitle }}
              </h2>
              <button @click="$emit('close')" class="flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <Icon name="mdi:close" class="block w-5 h-5" />
              </button>
            </div>

            <!-- ═══ Login / Register ═══ -->
            <template v-if="step === 'auth'">
              <!-- Tab switcher -->
              <div class="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-0.5 mb-4">
                <button @click="switchMode('login')"
                  class="flex-1 py-1.5 text-xs font-medium rounded-md transition-colors"
                  :class="mode === 'login'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'">
                  Sign In
                </button>
                <button @click="switchMode('register')"
                  class="flex-1 py-1.5 text-xs font-medium rounded-md transition-colors"
                  :class="mode === 'register'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'">
                  Create Account
                </button>
              </div>

              <p class="text-xs text-gray-500 dark:text-gray-500 mb-4">
                {{ mode === 'login' ? 'Sign in to sync your notes across devices.' : 'Signing up is optional. It enables cloud sync across devices.' }}
              </p>

              <!-- Error -->
              <div v-if="error" class="mb-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs">
                {{ error }}
              </div>

              <form @submit.prevent="handleSubmit" class="space-y-3">
                <!-- Name (register only) -->
                <div v-if="mode === 'register'">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Name</label>
                  <Input v-model="name" type="text" autocomplete="name" placeholder="Your name (optional)" :validate="false" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Email</label>
                  <Input v-model="email" type="email" required autocomplete="email" placeholder="you@example.com" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Password</label>
                  <Input v-model="password" type="password" required autocomplete="current-password"
                    :minlength="mode === 'register' ? 8 : undefined" placeholder="••••••••" :validate="false" />
                  <p v-if="mode === 'register'" class="text-xs text-gray-500 dark:text-gray-500 mt-1">At least 8 characters</p>
                </div>

                <!-- Confirm password (register only) -->
                <div v-if="mode === 'register'">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Confirm Password</label>
                  <Input v-model="confirmPassword" type="password" required autocomplete="new-password"
                    :minlength="8" placeholder="••••••••" :validate="false" />
                  <p v-if="passwordMismatch" class="text-xs text-red-600 dark:text-red-400 mt-1">Passwords do not match</p>
                </div>

                <button type="submit" :disabled="loading"
                  class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                  <Icon v-if="loading" name="mdi:loading" class="w-4 h-4 animate-spin" />
                  {{ mode === 'login' ? 'Sign In' : 'Create Account' }}
                </button>
              </form>

              <!-- Forgot password link (login only) -->
              <p v-if="mode === 'login'" class="text-center text-xs text-gray-500 dark:text-gray-500 mt-3">
                <button @click="startRecovery" class="text-primary-600 dark:text-primary-400 hover:underline">Forgot password?</button>
              </p>
            </template>

            <!-- ═══ Password Recovery: Enter Email ═══ -->
            <template v-else-if="step === 'recovery-email'">
              <div class="mb-4 px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800">
                <div class="flex gap-2">
                  <Icon name="mdi:database-remove-outline" class="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p class="text-xs text-red-700 dark:text-red-300 leading-relaxed">Password recovery will <span class="font-semibold">permanently delete all your encrypted notes</span>. They cannot be decrypted without the original password.</p>
                </div>
              </div>

              <p class="text-xs text-gray-500 dark:text-gray-500 mb-4">
                Enter your email address. If password recovery is enabled on your account, you'll receive a code.
              </p>

              <div v-if="error" class="mb-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs">
                {{ error }}
              </div>

              <form @submit.prevent="handleForgotPassword" class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Email</label>
                  <Input v-model="recoveryEmail" type="email" required placeholder="you@example.com" />
                </div>
                <button type="submit" :disabled="loading"
                  class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                  <Icon v-if="loading" name="mdi:loading" class="w-4 h-4 animate-spin" />
                  Send Recovery Code
                </button>
              </form>

              <p class="text-center text-xs text-gray-500 dark:text-gray-500 mt-3">
                <button @click="step = 'auth'; mode = 'login'" class="text-primary-600 dark:text-primary-400 hover:underline">Back to sign in</button>
              </p>
            </template>

            <!-- ═══ Password Recovery: Enter OTP ═══ -->
            <template v-else-if="step === 'recovery-otp'">
              <p class="text-xs text-gray-500 dark:text-gray-500 mb-4">
                If your account has recovery enabled, a 6-digit code was sent to <span class="font-medium text-gray-700 dark:text-gray-300">{{ recoveryEmail }}</span>.
              </p>

              <div v-if="error" class="mb-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs">
                {{ error }}
              </div>

              <form @submit.prevent="handleVerifyRecovery" class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Verification Code</label>
                  <Input v-model="otpCode" type="text" required :maxlength="6" pattern="[0-9]{6}"
                    validation-pattern="^[0-9]{6}$" validation-message="Enter a 6-digit code"
                    placeholder="000000" />
                </div>
                <button type="submit" :disabled="loading || otpCode.length !== 6"
                  class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                  <Icon v-if="loading" name="mdi:loading" class="w-4 h-4 animate-spin" />
                  Verify Code
                </button>
              </form>

              <p class="text-center text-xs text-gray-500 dark:text-gray-500 mt-3">
                <button @click="step = 'recovery-email'" class="text-primary-600 dark:text-primary-400 hover:underline">Use a different email</button>
              </p>
            </template>

            <!-- ═══ Password Recovery: Set New Password ═══ -->
            <template v-else-if="step === 'recovery-newpass'">
              <!-- Prominent destruction warning -->
              <div class="mb-4 px-3 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800">
                <div class="flex gap-2.5">
                  <Icon name="mdi:database-remove-outline" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div class="space-y-1.5">
                    <p class="text-xs font-semibold text-red-800 dark:text-red-200">All your notes will be permanently deleted</p>
                    <p class="text-xs text-red-700 dark:text-red-300 leading-relaxed">Your notes are encrypted with your current password. Resetting it means the encryption key is lost — <span class="font-semibold">every note will be irreversibly destroyed</span>. This cannot be undone.</p>
                  </div>
                </div>
              </div>

              <div v-if="error" class="mb-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-xs">
                {{ error }}
              </div>

              <form @submit.prevent="handleResetPassword" class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">New Password</label>
                  <Input v-model="newPassword" type="password" required :minlength="8" placeholder="••••••••" :validate="false" />
                  <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">At least 8 characters</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Confirm New Password</label>
                  <Input v-model="confirmNewPassword" type="password" required :minlength="8" placeholder="••••••••" :validate="false" />
                  <p v-if="confirmNewPassword && newPassword !== confirmNewPassword" class="text-xs text-red-600 dark:text-red-400 mt-1">Passwords do not match</p>
                </div>
                <button type="submit" :disabled="loading || !newPassword || newPassword.length < 8 || newPassword !== confirmNewPassword"
                  class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">
                  <Icon v-if="loading" name="mdi:loading" class="w-4 h-4 animate-spin" />
                  Reset Password &amp; Delete Notes
                </button>
              </form>
            </template>

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

const emit = defineEmits(['close', 'login', 'register', 'forgot-password', 'verify-recovery', 'reset-password'])

const step = ref('auth') // 'auth' | 'recovery-email' | 'recovery-otp' | 'recovery-newpass'
const mode = ref('login')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const name = ref('')

// Recovery state
const recoveryEmail = ref('')
const otpCode = ref('')
const recoveryToken = ref(null)
const newPassword = ref('')
const confirmNewPassword = ref('')

const passwordMismatch = computed(() => {
  return mode.value === 'register' && confirmPassword.value && password.value !== confirmPassword.value
})

const headerTitle = computed(() => {
  switch (step.value) {
    case 'auth': return mode.value === 'login' ? 'Welcome Back' : 'Create Account'
    case 'recovery-email': return 'Recover Password'
    case 'recovery-otp': return 'Enter Code'
    case 'recovery-newpass': return 'New Password'
    default: return 'Sign In'
  }
})

const switchMode = (m) => {
  mode.value = m
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  name.value = ''
}

const resetAll = () => {
  step.value = 'auth'
  mode.value = 'login'
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  name.value = ''
  recoveryEmail.value = ''
  otpCode.value = ''
  recoveryToken.value = null
  newPassword.value = ''
  confirmNewPassword.value = ''
}

watch(() => props.isOpen, (open) => {
  if (open) resetAll()
})

const handleSubmit = () => {
  if (mode.value === 'register' && password.value !== confirmPassword.value) return
  if (mode.value === 'login') {
    emit('login', { email: email.value, password: password.value })
  } else {
    emit('register', { email: email.value, password: password.value, name: name.value })
  }
}

const startRecovery = () => {
  recoveryEmail.value = email.value || ''
  step.value = 'recovery-email'
}

const handleForgotPassword = () => {
  emit('forgot-password', {
    email: recoveryEmail.value,
    onSuccess: () => { step.value = 'recovery-otp'; otpCode.value = '' }
  })
}

const handleVerifyRecovery = () => {
  emit('verify-recovery', {
    email: recoveryEmail.value,
    code: otpCode.value,
    onSuccess: (token) => { recoveryToken.value = token; step.value = 'recovery-newpass' }
  })
}

const handleResetPassword = () => {
  if (newPassword.value !== confirmNewPassword.value || newPassword.value.length < 8) return
  emit('reset-password', {
    recoveryToken: recoveryToken.value,
    newPassword: newPassword.value
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
