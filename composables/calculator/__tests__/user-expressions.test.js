/**
 * Tests for user-reported failing expressions:
 * 1. "25 ml in tea spoons" — multi-word unit alias "tea spoons" not recognized
 * 2. "10% of what is 30" — reverse percentage with value 30
 * 3. "(20 cm * 4 + 5%) in m" — arithmetic with multiplication & percentage inside unit conversion
 */
import { describe, it, expect } from 'vitest'
import { calc, calcNum, calcLines } from './helpers'

describe('Unit alias: tea spoon / tea spoons', () => {
  it('25 ml in tea spoons', () => {
    const result = calcNum('25 ml in tea spoons')
    // 25 ml / 4.92892 ml per tsp ≈ 5.072
    expect(result).toBeCloseTo(5.072, 1)
  })

  it('1 tea spoon in ml ≈ 4.93', () => {
    expect(calcNum('1 tea spoon in ml')).toBeCloseTo(4.93, 1)
  })

  it('3 tea spoons in tbsp = 1', () => {
    expect(calcNum('3 tea spoons in tbsp')).toBeCloseTo(1, 1)
  })

  it('25 ml in teaspoons (existing alias still works)', () => {
    expect(calcNum('25 ml in teaspoons')).toBeCloseTo(5.072, 1)
  })
})

describe('Reverse percentage: X% of what is Y', () => {
  it('10% of what is 30 = 300', () => {
    // If 10% of X = 30, then X = 30 / 0.10 = 300
    expect(calcNum('10% of what is 30')).toBeCloseTo(300, 0)
  })

  it('25% of what is 50 = 200', () => {
    expect(calcNum('25% of what is 50')).toBeCloseTo(200, 0)
  })

  it('5% of what is 6 = 120 (existing test)', () => {
    expect(calcNum('5% of what is 6')).toBeCloseTo(120, 0)
  })
})

describe('Arithmetic with units: multiplication and percentage in conversion', () => {
  it('(20 cm * 4 + 5%) in m', () => {
    // 20 cm * 4 = 80 cm, + 5% = 84 cm = 0.84 m
    expect(calcNum('(20 cm * 4 + 5%) in m')).toBeCloseTo(0.84, 2)
  })

  it('20 cm * 4 in m (multiplication with unit conversion)', () => {
    // 20 cm * 4 = 80 cm = 0.8 m
    expect(calcNum('20 cm * 4 in m')).toBeCloseTo(0.8, 2)
  })

  it('(10 cm * 3) in m', () => {
    expect(calcNum('(10 cm * 3) in m')).toBeCloseTo(0.3, 2)
  })

  it('(100 cm + 10%) in m', () => {
    // 100 cm + 10% = 110 cm = 1.1 m
    expect(calcNum('(100 cm + 10%) in m')).toBeCloseTo(1.1, 2)
  })
})

describe('Percentage with unit: X% of what is Y unit', () => {
  it('20% of what is 30 cm = 150 cm', () => {
    const result = calc('20% of what is 30 cm')
    expect(result).toMatch(/150/)
    expect(result).toMatch(/cm/)
  })

  it('10% of what is 50 kg = 500 kg', () => {
    const result = calc('10% of what is 50 kg')
    expect(result).toMatch(/500/)
    expect(result).toMatch(/kg/)
  })

  it('25% of what is 100 ml = 400 ml', () => {
    const result = calc('25% of what is 100 ml')
    expect(result).toMatch(/400/)
    expect(result).toMatch(/ml/)
  })
})

describe('Standalone unit expression with arithmetic (no conversion)', () => {
  it('(25 cm * 6 + 5%) = 157.5 cm', () => {
    const result = calc('(25 cm * 6 + 5%)')
    expect(result).toMatch(/157\.5/)
    expect(result).toMatch(/cm/)
  })

  it('25 cm * 6 + 5% = 157.5 cm', () => {
    const result = calc('25 cm * 6 + 5%')
    expect(result).toMatch(/157\.5/)
    expect(result).toMatch(/cm/)
  })

  it('10 m * 3 = 30 m', () => {
    const result = calc('10 m * 3')
    expect(result).toMatch(/30/)
    expect(result).toMatch(/m/)
  })

  it('(50 kg * 2) = 100 kg', () => {
    const result = calc('(50 kg * 2)')
    expect(result).toMatch(/100/)
    expect(result).toMatch(/kg/)
  })
})

describe('Currency with word operators shows result', () => {
  it('$8 times 3 = 24 USD, not hidden', () => {
    const result = calc('$8 times 3')
    expect(result).toMatch(/24/)
    expect(result).toMatch(/USD/)
  })

  it('price = $8 times 3 shows result', () => {
    const results = calcLines(['price = $8 times 3'])
    expect(results[0]).toMatch(/24/)
  })

  it('$10 plus $5 shows result', () => {
    const result = calc('$10 plus $5')
    expect(result).toMatch(/15/)
  })

  it('$20 minus $8 shows result', () => {
    const result = calc('$20 minus $8')
    expect(result).toMatch(/12/)
  })

  it('$100 divide by 4 shows result', () => {
    const result = calc('$100 divide by 4')
    expect(result).toMatch(/25/)
  })
})
