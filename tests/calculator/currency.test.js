/**
 * Tests for currency parsing, conversion, and arithmetic.
 */
import { describe, it, expect } from 'vitest'
import { calc, calcLines } from './helpers'

describe('Currency', () => {
  it('$30 returns value with USD', () => { expect(calc('$30')).toMatch(/30/) })
  it('€50 returns value with EUR', () => { expect(calc('€50')).toMatch(/50/) })
  it('£100 returns value with GBP', () => { expect(calc('£100')).toMatch(/100/) })

  it('$30 in EUR converts currency', () => {
    const result = calc('$30 in EUR')
    expect(result).toBeTruthy()
    expect(result).toMatch(/EUR/)
  })

  it('$30 in euro (common name)', () => { expect(calc('$30 in euro')).toBeTruthy() })
  it('currency arithmetic: $30 + €20 (mixed currencies)', () => { expect(calc('$30 + €20')).toBeTruthy() })

  it('100 USD in GBP', () => {
    const result = calc('100 USD in GBP')
    expect(result).toBeTruthy()
    expect(result).toMatch(/GBP/)
  })

  it('currency with variable: v = $20, v + $10', () => {
    const results = calcLines(['v = $20', 'v + $10'])
    expect(parseFloat(results[1])).toBe(30)
  })

  it('variable with EUR + USD: a = €1, a + $4 should convert correctly', () => {
    const results = calcLines(['a = €1', 'a + $4'])
    expect(results[1]).toMatch(/EUR/)
    expect(parseFloat(results[1])).not.toBeCloseTo(5, 1)
  })

  it('variable with USD + EUR: a = $10, a + €5 should convert correctly', () => {
    const results = calcLines(['a = $10', 'a + €5'])
    expect(results[1]).toMatch(/USD/)
    expect(parseFloat(results[1])).not.toBeCloseTo(15, 1)
  })

  it('variable with EUR currency used in conversion: a = €100, a in GBP', () => {
    const results = calcLines(['a = €100', 'a in GBP'])
    expect(results[1]).toMatch(/GBP/)
    const gbpValue = parseFloat(results[1])
    expect(gbpValue).toBeGreaterThan(80)
    expect(gbpValue).toBeLessThan(95)
  })

  it('two currency variables: a = €10, b = $10, a + b should convert', () => {
    const results = calcLines(['a = €10', 'b = $10', 'a + b'])
    expect(results[2]).toMatch(/EUR/)
    const eurValue = parseFloat(results[2])
    expect(eurValue).toBeCloseTo(18.7, 0)
  })

  it('currency variable multiplied by number: a = €50, a * 3', () => {
    const results = calcLines(['a = €50', 'a * 3'])
    expect(parseFloat(results[1])).toBe(150)
    expect(results[1]).toMatch(/EUR/)
  })

  it('parenthesized currency expression converted: a = €1, (a + $4) in GBP', () => {
    const results = calcLines(['a = €1', '(a + $4) in GBP'])
    expect(results[1]).toMatch(/GBP/)
    const gbpValue = parseFloat(results[1])
    expect(gbpValue).toBeGreaterThan(3.5)
    expect(gbpValue).toBeLessThan(4.5)
  })

  it('simple currency expression converted: $100 + €50 in GBP', () => {
    const results = calcLines(['$100 + €50 in GBP'])
    expect(results[0]).toMatch(/GBP/)
    const gbpValue = parseFloat(results[0])
    expect(gbpValue).toBeGreaterThan(110)
    expect(gbpValue).toBeLessThan(130)
  })

  it('currency variable expression converted: a = €100, a in GBP (no parens)', () => {
    const results = calcLines(['a = €100', 'a in GBP'])
    expect(results[1]).toMatch(/GBP/)
    const gbpValue = parseFloat(results[1])
    expect(gbpValue).toBeGreaterThan(80)
    expect(gbpValue).toBeLessThan(95)
  })
})
