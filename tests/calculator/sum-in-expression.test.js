/**
 * Tests for sum/total/average used inside larger expressions (e.g., "Salary - sum").
 * Regression: sum only worked standalone or at the start of an expression.
 */
import { describe, it, expect } from 'vitest'
import { calcLines, calcLinesLastNum } from './helpers'

describe('Sum inside expressions (not standalone)', () => {
  it('variable minus sum: Salario - sum', () => {
    const results = calcLines([
      'Salario = 1457',
      'Gasolina: 120',
      'Seguro: 60',
      'Ho: 20',
      'Comida: 200',
      'Abril = Salario - sum',
    ])
    // sum of lines 1-4 = 120+60+20+200 = 400
    // Salario - sum = 1457 - 400 = 1057
    expect(parseFloat(results[5])).toBe(1057)
  })

  it('variable minus sum with currency', () => {
    const results = calcLines([
      'Salario = €1457',
      'Gasolina: €120',
      'Seguro coche: €60',
      'Ho: €20',
      'Comida: €200',
      'Abril = Salario - sum',
    ])
    // sum = 120+60+20+200 = 400 EUR, Salario = 1457 EUR
    // 1457 - 400 = 1057
    expect(parseFloat(results[5])).toBeCloseTo(1057, 0)
  })

  it('number minus sum', () => {
    const results = calcLines([
      '10',
      '20',
      '30',
      '100 - sum',
    ])
    // sum = 10+20+30 = 60, 100 - 60 = 40
    expect(parseFloat(results[3])).toBe(40)
  })

  it('sum plus number', () => {
    const results = calcLines([
      '10',
      '20',
      'sum + 5',
    ])
    // sum = 30, 30 + 5 = 35
    expect(parseFloat(results[2])).toBe(35)
  })

  it('sum multiplied by number', () => {
    const results = calcLines([
      '10',
      '20',
      'sum * 2',
    ])
    // sum = 30, 30 * 2 = 60
    expect(parseFloat(results[2])).toBe(60)
  })

  it('variable plus sum', () => {
    const results = calcLines([
      'bonus = 500',
      '100',
      '200',
      'bonus + sum',
    ])
    // sum = 100+200 = 300, bonus + sum = 500 + 300 = 800
    expect(parseFloat(results[3])).toBe(800)
  })

  it('parenthesized expression with sum', () => {
    const results = calcLines([
      '100',
      '200',
      '(sum) * 2',
    ])
    // sum = 300, 300 * 2 = 600
    expect(parseFloat(results[2])).toBe(600)
  })

  it('full budget scenario across multiple months', () => {
    const results = calcLines([
      'Salario = 1457',
      '',
      'Gasolina: 120',
      'Seguro coche: 60',
      'Ho: 20',
      'Comida: 200',
      'Marzo = Salario - sum',
      '',
      'Gasolina: 100',
      'Seguro coche: 60',
      'Ho: 20',
      'Alquiler: 368',
      'Comida: 200',
      'Abril = Salario - sum',
    ])
    // Marzo group sum = 120+60+20+200 = 400, Marzo = 1457-400 = 1057
    expect(parseFloat(results[6])).toBe(1057)
    // Abril group sum = 100+60+20+368+200 = 748, Abril = 1457-748 = 709
    expect(parseFloat(results[13])).toBe(709)
  })

  it('average inside expression: variable - average', () => {
    const results = calcLines([
      'target = 100',
      '80',
      '90',
      '70',
      'diff = target - average',
    ])
    // average = (80+90+70)/3 = 80, target - average = 100 - 80 = 20
    expect(parseFloat(results[4])).toBe(20)
  })

  it('avg inside expression: 2 * avg', () => {
    const results = calcLines([
      '10',
      '20',
      '30',
      '2 * avg',
    ])
    // avg = 20, 2 * 20 = 40
    expect(parseFloat(results[3])).toBe(40)
  })
})
