const STORAGE_KEY = 'calcnotes-welcome-completed'

export const useWelcomeWizard = () => {
  const isOpen = ref(false)

  const hasCompleted = () => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return false
    }
  }

  const complete = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch { /* silent */ }
    isOpen.value = false
  }

  const showIfFirstTime = () => {
    if (!hasCompleted()) {
      isOpen.value = true
    }
  }

  return { isOpen, complete, showIfFirstTime }
}
