import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Capacitor } from '@capacitor/core'

/**
 * On native apps (iOS / Android), listens for toolbar button taps from the
 * native keyboard accessory view. Returns `isNativeToolbar` so the template
 * can hide the HTML toolbar.
 */
export const useNativeKeyboardToolbar = (opts: {
  onFormat: (before: string, after: string) => void
  onUndo: () => void
  onRedo: () => void
  onIndent: () => void
  onOutdent: () => void
}) => {
  const isNativeToolbar = ref(false)

  // Activate on native apps (iOS and Android), not web browser
  if (import.meta.client) {
    const platform = Capacitor.getPlatform()
    if (platform === 'ios' || platform === 'android') {
      isNativeToolbar.value = true
    }
  }

  const formatMap: Record<string, [string, string]> = {
    bold: ['**', '**'],
    italic: ['*', '*'],
    strikethrough: ['~~', '~~'],
    heading1: ['# ', ''],
    heading2: ['## ', ''],
    heading3: ['### ', ''],
    list: ['- ', ''],
    checklist: ['- [ ] ', ''],
    quote: ['> ', ''],
    code: ['`', '`'],
    link: ['[', '](url)'],
  }

  const handleNativeTap = (e: Event) => {
    const id = (e as CustomEvent).detail
    if (id === 'undo') { opts.onUndo(); return }
    if (id === 'redo') { opts.onRedo(); return }
    if (id === 'indent') { opts.onIndent(); return }
    if (id === 'outdent') { opts.onOutdent(); return }
    const fmt = formatMap[id]
    if (fmt) opts.onFormat(fmt[0], fmt[1])
  }

  onMounted(() => {
    if (!isNativeToolbar.value) return
    window.addEventListener('nativeToolbarTap', handleNativeTap)
  })

  onBeforeUnmount(() => {
    if (!isNativeToolbar.value) return
    window.removeEventListener('nativeToolbarTap', handleNativeTap)
  })

  return { isNativeToolbar }
}
