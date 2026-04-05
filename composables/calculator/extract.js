// Extract trailing numbers (with optional currency) from plain-text lines
// e.g. "Arwen 900 eur" → { value: 900, currency: 'EUR', display: '900 EUR' }
// e.g. "transporte Kaisa 2000" → { value: 2000, display: '2,000' }
import { currencyMap, exchangeRates } from './constants'
import { formatResult } from './math'

/**
 * Try to extract a trailing number with optional currency/unit suffix from a text line.
 * Returns null if no number is found.
 */
export const extractTrailingNumber = (input) => {
  // Match a number (with optional decimals/commas) optionally followed by a currency word/code
  // The number must be preceded by a space or start of string (after any text)
  const match = input.match(/(?:^|\s)(\d[\d,]*(?:\.\d+)?)\s*([a-zA-Z€$£¥₹₽]{1,20})?$/)
  if (!match) return null

  const rawNum = match[1].replace(/,/g, '')
  const value = parseFloat(rawNum)
  if (isNaN(value)) return null

  const suffix = match[2]
  if (suffix) {
    const currencyCode = currencyMap[suffix.toLowerCase()] || suffix.toUpperCase()
    if (exchangeRates.value[currencyCode]) {
      return { value, currency: currencyCode, display: `${formatResult(value)} ${currencyCode}` }
    }
  }

  // No currency suffix or unrecognized suffix — return plain number
  return { value, currency: null, display: formatResult(value) }
}
