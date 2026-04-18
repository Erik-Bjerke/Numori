/**
 * Tests for date/time, duration, fromunix, and timezone conversion.
 */
import { describe, it, expect } from 'vitest'
import { calc, calcNum } from './helpers'

describe('Date & Time', () => {
  it('now returns current datetime', () => {
    expect(calc('now')).toBeTruthy()
  })
  it('today returns current date', () => {
    expect(calc('today')).toBeTruthy()
  })
  it('yesterday returns previous date', () => {
    expect(calc('yesterday')).toBeTruthy()
  })
  it('tomorrow returns next date', () => {
    expect(calc('tomorrow')).toBeTruthy()
  })
  it('next week', () => {
    expect(calc('next week')).toBeTruthy()
  })
  it('last week', () => {
    expect(calc('last week')).toBeTruthy()
  })
  it('next month', () => {
    expect(calc('next month')).toBeTruthy()
  })
  it('last month', () => {
    expect(calc('last month')).toBeTruthy()
  })
  it('next year', () => {
    expect(calc('next year')).toBeTruthy()
  })
  it('last year', () => {
    expect(calc('last year')).toBeTruthy()
  })
  it('today + 3 days returns a date', () => {
    expect(calc('today + 3 days')).toBeTruthy()
  })
  it('today - 1 week returns a date', () => {
    expect(calc('today - 1 week')).toBeTruthy()
  })
  it('today + 2 months returns a date', () => {
    expect(calc('today + 2 months')).toBeTruthy()
  })
})

describe('Duration Calculations', () => {
  it('2 hours + 30 minutes', () => {
    expect(calc('2 hours + 30 minutes')).toBeTruthy()
  })
  it('1 day in hours = 24', () => {
    expect(calcNum('1 day in hours')).toBeCloseTo(24, 0)
  })
})

describe('fromunix()', () => {
  it('fromunix(1446587186) returns a date', () => {
    const result = calc('fromunix(1446587186)')
    expect(result).toBeTruthy()
    expect(result).toMatch(/2015/)
  })
  it('fromunix(0) returns epoch', () => {
    const result = calc('fromunix(0)')
    expect(result).toBeTruthy()
    expect(result).toMatch(/1970/)
  })
})

describe('Timezone Conversion', () => {
  it('PST time', () => {
    expect(calc('PST time')).toBeTruthy()
  })
  it('time in Madrid', () => {
    expect(calc('time in Madrid')).toBeTruthy()
  })
  it('2:30 pm HKT in Berlin', () => {
    expect(calc('2:30 pm HKT in Berlin')).toBeTruthy()
  })
})
