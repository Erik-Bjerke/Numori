/**
 * Tests for unit conversions: length, weight, volume, temperature, area,
 * speed, data, time, CSS units, angular units, and SI prefixes.
 */
import { describe, it, expect } from 'vitest'
import { calc, calcLines, calcNum } from './helpers'

describe('Unit Conversion — Length', () => {
  it('1 km in m = 1000', () => { expect(calcNum('1 km in m')).toBeCloseTo(1000, 0) })
  it('1 mile in km ≈ 1.609', () => { expect(calcNum('1 mile in km')).toBeCloseTo(1.609, 2) })
  it('1 foot in cm ≈ 30.48', () => { expect(calcNum('1 foot in cm')).toBeCloseTo(30.48, 1) })
  it('1 inch in cm ≈ 2.54', () => { expect(calcNum('1 inch in cm')).toBeCloseTo(2.54, 2) })
  it('1 yard in m ≈ 0.9144', () => { expect(calcNum('1 yard in m')).toBeCloseTo(0.9144, 3) })
  it('100 cm in m = 1', () => { expect(calcNum('100 cm in m')).toBeCloseTo(1, 5) })
  it('5280 feet in miles = 1', () => { expect(calcNum('5280 feet in miles')).toBeCloseTo(1, 2) })
  it('arithmetic with units: 1 km + 500 m in m = 1500', () => { expect(calcNum('1 km + 500 m in m')).toBeCloseTo(1500, 0) })
})

describe('Unit Conversion — Weight', () => {
  it('1 kg in lb ≈ 2.205', () => { expect(calcNum('1 kg in lb')).toBeCloseTo(2.205, 2) })
  it('1 lb in kg ≈ 0.4536', () => { expect(calcNum('1 lb in kg')).toBeCloseTo(0.4536, 3) })
  it('1 oz in g ≈ 28.35', () => { expect(calcNum('1 oz in g')).toBeCloseTo(28.35, 1) })
  it('1 tonne in kg = 1000', () => { expect(calcNum('1 tonne in kg')).toBeCloseTo(1000, 0) })
  it('1 stone in lb ≈ 14', () => { expect(calcNum('1 stone in lb')).toBeCloseTo(14, 0) })
})

describe('Unit Conversion — Volume', () => {
  it('1 gallon in liters ≈ 3.785', () => { expect(calcNum('1 gallon in liters')).toBeCloseTo(3.785, 2) })
  it('1 pint in ml ≈ 473', () => { expect(calcNum('1 pint in ml')).toBeCloseTo(473, 0) })
  it('1 quart in liters ≈ 0.946', () => { expect(calcNum('1 quart in liters')).toBeCloseTo(0.946, 2) })
  it('1 cup in ml ≈ 237', () => { expect(calcNum('1 cup in ml')).toBeCloseTo(237, 0) })
  it('1 tablespoon in ml ≈ 14.79', () => { expect(calcNum('1 tablespoon in ml')).toBeCloseTo(14.79, 1) })
  it('1 teaspoon in ml ≈ 4.93', () => { expect(calcNum('1 teaspoon in ml')).toBeCloseTo(4.93, 1) })
  it('cubic inches: 20 cu cm in ml', () => { expect(calcNum('20 cu cm in ml')).toBeCloseTo(20, 0) })
  it('cubic meters: 1 cbm in liters = 1000', () => { expect(calcNum('1 cbm in liters')).toBeCloseTo(1000, 0) })
})

describe('Unit Conversion — Temperature', () => {
  it('0 celsius in fahrenheit = 32', () => { expect(calcNum('0 celsius in fahrenheit')).toBeCloseTo(32, 1) })
  it('100 celsius in fahrenheit = 212', () => { expect(calcNum('100 celsius in fahrenheit')).toBeCloseTo(212, 1) })
  it('32 fahrenheit in celsius = 0', () => { expect(calcNum('32 fahrenheit in celsius')).toBeCloseTo(0, 1) })
  it('0 celsius in kelvin = 273.15', () => { expect(calcNum('0 celsius in kelvin')).toBeCloseTo(273.15, 1) })
  it('0 kelvin in celsius = -273.15', () => { expect(calcNum('0 kelvin in celsius')).toBeCloseTo(-273.15, 1) })
  it('180 celsius in fahrenheit = 356', () => { expect(calcNum('180 celsius in fahrenheit')).toBeCloseTo(356, 1) })
  it('350 fahrenheit in celsius ≈ 176.67', () => { expect(calcNum('350 fahrenheit in celsius')).toBeCloseTo(176.67, 0) })
})

describe('Unit Conversion — Area', () => {
  it('1 acre in sqm ≈ 4046.86', () => { expect(calcNum('1 acre in sqm')).toBeCloseTo(4046.86, 0) })
  it('1 hectare in acres ≈ 2.471', () => { expect(calcNum('1 hectare in acres')).toBeCloseTo(2.471, 2) })
  it('1 sqft in sqm ≈ 0.0929', () => { expect(calcNum('1 sqft in sqm')).toBeCloseTo(0.0929, 3) })
  it('20 sq cm in sqm', () => { expect(calcNum('20 sq cm in sqm')).toBeCloseTo(0.002, 3) })
  it('30 square inches in sqft', () => {
    const result = calcNum('30 square inches in sqft')
    expect(result).toBeCloseTo(30 * 0.00064516 / 0.092903, 2)
  })
})

describe('Unit Conversion — Speed', () => {
  it('100 kph in mph ≈ 62.14', () => { expect(calcNum('100 kph in mph')).toBeCloseTo(62.14, 1) })
  it('60 mph in kph ≈ 96.56', () => { expect(calcNum('60 mph in kph')).toBeCloseTo(96.56, 1) })
  it('1 knot in kph ≈ 1.852', () => { expect(calcNum('1 knot in kph')).toBeCloseTo(1.852, 2) })
})

describe('Unit Conversion — Data', () => {
  it('1 GB in MB = 1000', () => { expect(calcNum('1 GB in MB')).toBeCloseTo(1000, 0) })
  it('1 TB in GB = 1000', () => { expect(calcNum('1 TB in GB')).toBeCloseTo(1000, 0) })
  it('1 GiB in MiB = 1024', () => { expect(calcNum('1 GiB in MiB')).toBeCloseTo(1024, 0) })
  it('1 byte in bits = 8', () => { expect(calcNum('1 byte in bits')).toBeCloseTo(8, 0) })
  it('1 KB in bytes = 1000', () => { expect(calcNum('1 KB in bytes')).toBeCloseTo(1000, 0) })
  it('1 KiB in bytes = 1024', () => { expect(calcNum('1 KiB in bytes')).toBeCloseTo(1024, 0) })
})

describe('Unit Conversion — Time', () => {
  it('1 hour in minutes = 60', () => { expect(calcNum('1 hour in minutes')).toBeCloseTo(60, 0) })
  it('1 day in hours = 24', () => { expect(calcNum('1 day in hours')).toBeCloseTo(24, 0) })
  it('1 week in days = 7', () => { expect(calcNum('1 week in days')).toBeCloseTo(7, 0) })
  it('1 year in days = 365', () => { expect(calcNum('1 year in days')).toBeCloseTo(365, 0) })
  it('round(1 month in days) = 30', () => { expect(calcNum('round(1 month in days)')).toBeCloseTo(30, 0) })
})

describe('CSS Units', () => {
  it('12 pt in px ≈ 16', () => { expect(calcNum('12 pt in px')).toBeCloseTo(16, 0) })
  it('1 em in px = 16 (default)', () => { expect(calcNum('1 em in px')).toBeCloseTo(16, 0) })
  it('1 rem in px = 16 (default)', () => { expect(calcNum('1 rem in px')).toBeCloseTo(16, 0) })
  it('custom em: em = 20px, then 1.2 em in px = 24', () => {
    const results = calcLines(['em = 20', '1.2 em in px'])
    expect(parseFloat(results[1])).toBeCloseTo(24, 0)
  })
  it('1 inch in px = 96 (default ppi)', () => { expect(calcNum('1 inch in px')).toBeCloseTo(96, 0) })
  it('custom ppi: ppi = 326, 1 cm in px', () => {
    const results = calcLines(['ppi = 326', '1 cm in px'])
    expect(parseFloat(results[1])).toBeCloseTo(128.35, 0)
  })
})

describe('Angular Units', () => {
  it('180 degrees in radians = pi', () => { expect(calcNum('180 degrees in radians')).toBeCloseTo(Math.PI, 3) })
  it('pi radians in degrees = 180', () => { expect(calcNum(`${Math.PI} radians in degrees`)).toBeCloseTo(180, 1) })
  it('90° in radians = pi/2', () => { expect(calcNum('90° in radians')).toBeCloseTo(Math.PI / 2, 3) })
  it('45 degrees in radians', () => { expect(calcNum('45 degrees in radians')).toBeCloseTo(Math.PI / 4, 3) })
})

describe('SI Prefixes', () => {
  it('1 km = 1000 m (kilo)', () => { expect(calcNum('1 km in m')).toBeCloseTo(1000, 0) })
  it('1 mg = 0.001 g (milli)', () => { expect(calcNum('1 mg in g')).toBeCloseTo(0.001, 5) })
  it('1 MB = 1000000 bytes (mega)', () => { expect(calcNum('1 MB in bytes')).toBeCloseTo(1000000, 0) })
  it('1 GB = 1000 MB (giga)', () => { expect(calcNum('1 GB in MB')).toBeCloseTo(1000, 0) })
  it('1 kilogram in grams = 1000', () => { expect(calcNum('1 kilogram in grams')).toBeCloseTo(1000, 0) })
  it('1 millimeter in meters = 0.001', () => { expect(calcNum('1 millimeter in meters')).toBeCloseTo(0.001, 5) })
})
