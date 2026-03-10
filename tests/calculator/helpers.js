// Shared test helpers for calculator tests
import { vi } from 'vitest'

// Mock Vue's ref for the composable
vi.stubGlobal('ref', (val) => ({ value: val }))

// Import after mocking
const { useCalculator } = await import('../../composables/useCalculator.js')

// Helper: evaluate a single expression and return the result string
export function calc(expression) {
  const { evaluateLines } = useCalculator()
  const results = evaluateLines([expression])
  return results[0].result
}

// Helper: evaluate multiple lines and return all result strings
export function calcLines(lines) {
  const { evaluateLines } = useCalculator()
  const results = evaluateLines(lines)
  return results.map(r => r.result)
}

// Helper: evaluate and return numeric value
export function calcNum(expression) {
  const result = calc(expression)
  if (result === null) return null
  return parseFloat(result)
}

// Helper: evaluate multiple lines and return the last result as number
export function calcLinesLastNum(lines) {
  const results = calcLines(lines)
  const last = results[results.length - 1]
  if (last === null) return null
  return parseFloat(last)
}

export { useCalculator }
