<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-50 dark:bg-gray-925"
      >
        <div class="w-full max-w-xs px-6 space-y-6 text-center">
          <!-- App icon / lock icon -->
          <div class="flex flex-col items-center gap-3">
            <div
              class="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"
            >
              <Icon name="mdi:lock" class="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Numori Notes
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ unlockLabel }}
            </p>
          </div>

          <!-- Biometric prompt (shown first for biometrics method) -->
          <div v-if="showBiometricPrompt" class="space-y-3">
            <UiButton
              variant="solid"
              color="primary"
              block
              @click="attemptBiometrics"
            >
              <Icon name="mdi:fingerprint" class="w-5 h-5" />
              Unlock with biometrics
            </UiButton>
            <UiButton
              variant="ghost"
              color="gray"
              block
              size="sm"
              @click="showBiometricPrompt = false"
            >
              Use {{ fallbackLabel }} instead
            </UiButton>
          </div>

          <!-- PIN input -->
          <div v-else-if="activeMethod === 'pin'" class="space-y-4">
            <div class="flex justify-center gap-2">
              <div
                v-for="i in pinLength"
                :key="i"
                class="w-3 h-3 rounded-full transition-colors duration-150"
                :class="
                  i <= enteredPin.length
                    ? 'bg-primary-600 dark:bg-primary-400'
                    : 'bg-gray-300 dark:bg-gray-600'
                "
              />
            </div>

            <!-- Number pad -->
            <div class="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
              <UiButton
                v-for="n in [1,2,3,4,5,6,7,8,9]"
                :key="n"
                variant="ghost"
                color="gray"
                class="h-14 text-xl font-medium rounded-xl"
                @click="enterDigit(n)"
              >
                {{ n }}
              </UiButton>
              <div />
              <UiButton
                variant="ghost"
                color="gray"
                class="h-14 text-xl font-medium rounded-xl"
                @click="enterDigit(0)"
              >
                0
              </UiButton>
              <UiButton
                variant="ghost"
                color="gray"
                class="h-14 rounded-xl"
                :disabled="enteredPin.length === 0"
                @click="deleteDigit"
              >
                <Icon name="mdi:backspace-outline" class="w-5 h-5" />
              </UiButton>
            </div>

            <!-- Biometrics shortcut -->
            <UiButton
              v-if="hasBiometrics"
              variant="ghost"
              color="primary"
              size="sm"
              @click="showBiometricPrompt = true"
            >
              <Icon name="mdi:fingerprint" class="w-4 h-4" />
              Use biometrics
            </UiButton>
          </div>

          <!-- Password input -->
          <div v-else-if="activeMethod === 'password'" class="space-y-4">
            <UiInput
              ref="passwordInputRef"
              v-model="enteredPassword"
              type="password"
              placeholder="Enter password"
              :validate="false"
              @keydown.enter="submitPassword"
            />
            <UiButton
              variant="solid"
              color="primary"
              block
              :disabled="!enteredPassword"
              @click="submitPassword"
            >
              Unlock
            </UiButton>

            <!-- Biometrics shortcut -->
            <UiButton
              v-if="hasBiometrics"
              variant="ghost"
              color="primary"
              size="sm"
              @click="showBiometricPrompt = true"
            >
              <Icon name="mdi:fingerprint" class="w-4 h-4" />
              Use biometrics
            </UiButton>
          </div>

          <!-- Error message -->
          <Transition
            enter-active-class="transition duration-200"
            enter-from-class="opacity-0 -translate-y-1"
            leave-active-class="transition duration-150"
            leave-to-class="opacity-0"
          >
            <p v-if="error" class="text-sm text-red-600 dark:text-red-400">
              {{ error }}
            </p>
          </Transition>

          <!-- Logout -->
          <UiButton
            variant="ghost"
            color="red"
            size="sm"
            @click="$emit('logout')"
          >
            <Icon name="mdi:logout-variant" class="w-4 h-4" />
            Sign out
          </UiButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  show: { type: Boolean, default: false },
})

defineEmits(['logout'])

const { settings, biometricsEnrolled, unlock, unlockWithBiometrics } = useAppLock()

const pinLength = 4
const enteredPin = ref('')
const enteredPassword = ref('')
const error = ref('')
const showBiometricPrompt = ref(false)
const passwordInputRef = ref(null)

const hasBiometrics = computed(() => settings.method === 'biometrics' && biometricsEnrolled.value)

const activeMethod = computed(() => {
  if (settings.method === 'biometrics') {
    return showBiometricPrompt.value ? 'biometrics' : settings.biometricsFallback
  }
  return settings.method
})

const unlockLabel = computed(() => {
  if (settings.method === 'biometrics' && showBiometricPrompt.value) return 'Authenticate to continue'
  if (activeMethod.value === 'pin') return 'Enter your PIN to unlock'
  return 'Enter your password to unlock'
})

const fallbackLabel = computed(() => {
  return settings.biometricsFallback === 'pin' ? 'PIN' : 'password'
})

const enterDigit = (digit) => {
  if (enteredPin.value.length >= pinLength) return
  enteredPin.value += String(digit)
  error.value = ''

  if (enteredPin.value.length === pinLength) {
    const success = unlock(enteredPin.value)
    if (!success) {
      error.value = 'Incorrect PIN'
      setTimeout(() => { enteredPin.value = '' }, 300)
    }
  }
}

const deleteDigit = () => {
  enteredPin.value = enteredPin.value.slice(0, -1)
  error.value = ''
}

const submitPassword = () => {
  if (!enteredPassword.value) return
  const success = unlock(enteredPassword.value)
  if (!success) {
    error.value = 'Incorrect password'
  } else {
    enteredPassword.value = ''
  }
}

const attemptBiometrics = async () => {
  error.value = ''
  const success = await unlockWithBiometrics()
  if (!success) {
    error.value = 'Biometric authentication failed'
    showBiometricPrompt.value = false
  }
}

// Auto-trigger biometrics when lock screen appears
watch(
  () => props.show,
  async (visible) => {
    if (!visible) {
      enteredPin.value = ''
      enteredPassword.value = ''
      error.value = ''
      return
    }
    if (hasBiometrics.value) {
      showBiometricPrompt.value = true
      await nextTick()
      attemptBiometrics()
    } else {
      showBiometricPrompt.value = false
      if (activeMethod.value === 'password') {
        await nextTick()
        passwordInputRef.value?.$el?.querySelector('input')?.focus()
      }
    }
  },
)
</script>
