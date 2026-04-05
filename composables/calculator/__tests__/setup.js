// Mock Nuxt's auto-imported `ref` before any module loads
globalThis.ref = (v) => ({ value: v })
