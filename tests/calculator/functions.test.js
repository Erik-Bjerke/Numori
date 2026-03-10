/**
 * Tests for math functions, trigonometry, inverse trig, and hyperbolic functions.
 */
import { describe, it, expect } from 'vitest'
import { calcNum } from './helpers'

describe('Math Functions', () => {
  it('sqrt(16) = 4', () => { expect(calcNum('sqrt(16)')).toBe(4) })
  it('cbrt(8) = 2', () => { expect(calcNum('cbrt(8)')).toBe(2) })
  it('abs(-4) = 4', () => { expect(calcNum('abs(-4)')).toBe(4) })
  it('log(100) = 2 (base 10)', () => { expect(calcNum('log(100)')).toBeCloseTo(2, 5) })
  it('ln(e) = 1', () => { expect(calcNum('ln(2.718281828459045)')).toBeCloseTo(1, 5) })
  it('fact(5) = 120', () => { expect(calcNum('fact(5)')).toBe(120) })
  it('round(3.45) = 3', () => { expect(calcNum('round(3.45)')).toBe(3) })
  it('round(3.55) = 4', () => { expect(calcNum('round(3.55)')).toBe(4) })
  it('ceil(3.76) = 4', () => { expect(calcNum('ceil(3.76)')).toBe(4) })
  it('floor(2.56) = 2', () => { expect(calcNum('floor(2.56)')).toBe(2) })
  it('root 2 (8) ≈ 2.83 (square root of 8)', () => { expect(calcNum('root 2 (8)')).toBeCloseTo(Math.sqrt(8), 2) })
  it('root 3 (27) = 3 (cube root)', () => { expect(calcNum('root 3 (27)')).toBeCloseTo(3, 5) })
  it('log 2 (10) = log base 2 of 10', () => { expect(calcNum('log 2 (10)')).toBeCloseTo(Math.log(10) / Math.log(2), 3) })
  it('log 10 (1000) = 3', () => { expect(calcNum('log 10 (1000)')).toBeCloseTo(3, 5) })
})

describe('Trigonometry', () => {
  it('sin(0) = 0', () => { expect(calcNum('sin(0)')).toBeCloseTo(0, 5) })
  it('cos(0) = 1', () => { expect(calcNum('cos(0)')).toBeCloseTo(1, 5) })
  it('tan(0) = 0', () => { expect(calcNum('tan(0)')).toBeCloseTo(0, 5) })
  it('sin(45°) ≈ 0.7071 (degrees)', () => { expect(calcNum('sin(45°)')).toBeCloseTo(Math.sin(45 * Math.PI / 180), 3) })
  it('cos(60°) = 0.5 (degrees)', () => { expect(calcNum('cos(60°)')).toBeCloseTo(0.5, 3) })
  it('tan(45°) ≈ 1 (degrees)', () => { expect(calcNum('tan(45°)')).toBeCloseTo(1, 3) })
  it('sin(pi/2) = 1 (radians)', () => { expect(calcNum(`sin(${Math.PI / 2})`)).toBeCloseTo(1, 5) })
})

describe('Inverse Trigonometry', () => {
  it('arcsin(1) = pi/2', () => { expect(calcNum('arcsin(1)')).toBeCloseTo(Math.PI / 2, 3) })
  it('arccos(0) = pi/2', () => { expect(calcNum('arccos(0)')).toBeCloseTo(Math.PI / 2, 3) })
  it('arctan(1) = pi/4', () => { expect(calcNum('arctan(1)')).toBeCloseTo(Math.PI / 4, 3) })
  it('arcsin(0.5) = pi/6', () => { expect(calcNum('arcsin(0.5)')).toBeCloseTo(Math.PI / 6, 3) })
})

describe('Hyperbolic Functions', () => {
  it('sinh(0) = 0', () => { expect(calcNum('sinh(0)')).toBeCloseTo(0, 5) })
  it('sinh(1) ≈ 1.1752', () => { expect(calcNum('sinh(1)')).toBeCloseTo(Math.sinh(1), 3) })
  it('cosh(0) = 1', () => { expect(calcNum('cosh(0)')).toBeCloseTo(1, 5) })
  it('cosh(1) ≈ 1.5431', () => { expect(calcNum('cosh(1)')).toBeCloseTo(Math.cosh(1), 3) })
  it('tanh(0) = 0', () => { expect(calcNum('tanh(0)')).toBeCloseTo(0, 5) })
  it('tanh(1) ≈ 0.7616', () => { expect(calcNum('tanh(1)')).toBeCloseTo(Math.tanh(1), 3) })
})
