/**
 * Tests for basic arithmetic, word operators, implicit multiplication,
 * number formats, scientific notation, scales, and constants.
 */
import { describe, it, expect } from 'vitest'
import { calc, calcNum } from './helpers'

describe('Basic Arithmetic', () => {
  it('addition', () => {
    expect(calcNum('2 + 3')).toBe(5)
  })
  it('subtraction', () => {
    expect(calcNum('10 - 4')).toBe(6)
  })
  it('multiplication', () => {
    expect(calcNum('6 * 7')).toBe(42)
  })
  it('division', () => {
    expect(calcNum('20 / 4')).toBe(5)
  })
  it('exponentiation', () => {
    expect(calcNum('2 ^ 10')).toBe(1024)
  })
  it('modulo', () => {
    expect(calcNum('17 mod 5')).toBe(2)
  })
  it('negative numbers', () => {
    expect(calcNum('-5 + 3')).toBe(-2)
  })
  it('decimal numbers', () => {
    expect(calcNum('3.14 * 2')).toBeCloseTo(6.28, 2)
  })
  it('order of operations', () => {
    expect(calcNum('2 + 3 * 4')).toBe(14)
  })
  it('parentheses', () => {
    expect(calcNum('(2 + 3) * 4')).toBe(20)
  })
  it('nested parentheses', () => {
    expect(calcNum('((2 + 3) * (4 - 1))')).toBe(15)
  })
})

describe('Word Operators', () => {
  it('plus', () => {
    expect(calcNum('5 plus 3')).toBe(8)
  })
  it('and (addition)', () => {
    expect(calcNum('5 and 3')).toBe(8)
  })
  it('with (addition)', () => {
    expect(calcNum('5 with 3')).toBe(8)
  })
  it('minus', () => {
    expect(calcNum('10 minus 3')).toBe(7)
  })
  it('subtract', () => {
    expect(calcNum('10 subtract 3')).toBe(7)
  })
  it('without', () => {
    expect(calcNum('10 without 3')).toBe(7)
  })
  it('times', () => {
    expect(calcNum('8 times 9')).toBe(72)
  })
  it('multiplied by', () => {
    expect(calcNum('8 multiplied by 9')).toBe(72)
  })
  it('mul', () => {
    expect(calcNum('8 mul 9')).toBe(72)
  })
  it('divide', () => {
    expect(calcNum('20 divide 4')).toBe(5)
  })
  it('divide by', () => {
    expect(calcNum('20 divide by 4')).toBe(5)
  })
})

describe('Implicit Multiplication', () => {
  it('number followed by parenthesized expression: 6 (3) = 18', () => {
    expect(calcNum('6 (3)')).toBe(18)
  })
  it('parenthesized expressions adjacent: (2)(3) = 6', () => {
    expect(calcNum('(2)(3)')).toBe(6)
  })
  it('compound expression: 1 meter 20 cm should equal 120 cm', () => {
    const result = calc('1 meter 20 cm in cm')
    expect(parseFloat(result)).toBeCloseTo(120, 0)
  })
})

describe('Number Formats', () => {
  it('binary: 0b110111011', () => {
    expect(calcNum('0b110111011')).toBe(443)
  })
  it('octal: 0o1435343', () => {
    expect(calcNum('0o1435343')).toBe(0o1435343)
  })
  it('hexadecimal: 0xFF', () => {
    expect(calcNum('0xFF')).toBe(255)
  })
  it('hex arithmetic: 0xFF + 1', () => {
    expect(calcNum('0xFF + 1')).toBe(256)
  })
  it('binary arithmetic: 0b1010 + 0b0101', () => {
    expect(calcNum('0b1010 + 0b0101')).toBe(15)
  })
  it('convert to hex: 255 in hex', () => {
    expect(calc('255 in hex')).toMatch(/[Ff][Ff]|ff|FF/)
  })
  it('convert to binary: 10 in bin', () => {
    expect(calc('10 in bin')).toMatch(/1010/)
  })
  it('convert to octal: 8 in oct', () => {
    expect(calc('8 in oct')).toMatch(/10/)
  })
  it('cross-base conversion: 0o1435343 in hex', () => {
    expect(calc('0o1435343 in hex')).toBeTruthy()
  })
})

describe('Scientific Notation', () => {
  it('number in sci', () => {
    expect(calc('5300 in sci')).toMatch(/5\.3.*10|5\.3e/)
  })
  it('number in scientific', () => {
    expect(calc('5300 in scientific')).toMatch(/5\.3.*10|5\.3e/)
  })
})

describe('Scales', () => {
  it('k scale: 5k = 5000', () => {
    expect(calcNum('5k')).toBe(5000)
  })
  it('thousand scale: 5 thousand = 5000', () => {
    expect(calcNum('5 thousand')).toBe(5000)
  })
  it('M scale: 2M = 2000000', () => {
    expect(calcNum('2M')).toBe(2000000)
  })
  it('million scale: 2 million = 2000000', () => {
    expect(calcNum('2 million')).toBe(2000000)
  })
  it('billion scale: 1 billion = 1000000000', () => {
    expect(calcNum('1 billion')).toBe(1000000000)
  })
  it('scale arithmetic: 2k + 500', () => {
    expect(calcNum('2k + 500')).toBe(2500)
  })
  it('scale arithmetic: 1.5M - 500k', () => {
    expect(calcNum('1.5M - 500k')).toBe(1000000)
  })
})

describe('Constants', () => {
  it('pi', () => {
    expect(calcNum('pi')).toBeCloseTo(Math.PI, 5)
  })
  it('e', () => {
    expect(calcNum('e')).toBeCloseTo(Math.E, 5)
  })
  it('tau = 2*pi', () => {
    expect(calcNum('tau')).toBeCloseTo(Math.PI * 2, 5)
  })
  it('phi (golden ratio)', () => {
    expect(calcNum('phi')).toBeCloseTo((1 + Math.sqrt(5)) / 2, 5)
  })
  it('pi * 2', () => {
    expect(calcNum('pi * 2')).toBeCloseTo(Math.PI * 2, 5)
  })
  it('e ^ 2', () => {
    expect(calcNum('e ^ 2')).toBeCloseTo(Math.E ** 2, 5)
  })
})

describe('Bitwise Operations', () => {
  it('bitwise AND: 12 & 10 = 8', () => {
    expect(calcNum('12 & 10')).toBe(8)
  })
  it('bitwise OR: 12 | 10 = 14', () => {
    expect(calcNum('12 | 10')).toBe(14)
  })
  it('bitwise XOR: 12 xor 10 = 6', () => {
    expect(calcNum('12 xor 10')).toBe(6)
  })
  it('left shift: 1 << 4 = 16', () => {
    expect(calcNum('1 << 4')).toBe(16)
  })
  it('right shift: 16 >> 2 = 4', () => {
    expect(calcNum('16 >> 2')).toBe(4)
  })
})
