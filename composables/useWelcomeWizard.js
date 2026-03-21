const STORAGE_KEY = 'calcnotes-welcome-completed'

export const useWelcomeWizard = () => {
  const isOpen = ref(false)
  const completed = useLocalStorage(STORAGE_KEY, '')

  const hasCompleted = () => completed.value === '1'

  const complete = () => {
    completed.value = '1'
    isOpen.value = false
  }

  const showIfFirstTime = () => {
    if (!hasCompleted()) {
      isOpen.value = true
    }
  }

  return { isOpen, complete, showIfFirstTime }
}
