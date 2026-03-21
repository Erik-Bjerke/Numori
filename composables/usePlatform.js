import { Capacitor } from '@capacitor/core'

/**
 * Platform detection helper for Capacitor apps.
 */
export const usePlatform = () => {
  const isNative = Capacitor.isNativePlatform()
  const platform = Capacitor.getPlatform() // 'android' | 'ios' | 'web'

  return { isNative, platform }
}
