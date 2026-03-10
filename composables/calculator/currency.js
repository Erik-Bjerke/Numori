// Currency parsing, conversion, and exchange rate fetching
import { currencyMap, exchangeRates, ratesFetched, variables } from './constants'
import { evaluateMath } from './math'

// Fetch live exchange rates
export const fetchExchangeRates = async () => {
  const tryFetch = async (url) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }

  const applyRates = (rates) => {
    rates.USD = 1
    exchangeRates.value = rates
    ratesFetched.value = true
  }

  // Primary: ExchangeRate-API (base USD)
  try {
    const data = await tryFetch('https://open.er-api.com/v6/latest/USD')
    if (data?.result === 'success' && data?.rates) {
      applyRates({ ...data.rates })
      return
    }
  } catch { /* fall through to secondary */ }

  // Secondary: fawazahmed0/exchange-api
  const fawazPrimary = 'https://latest.currency-api.pages.dev/v1/currencies/usd.min.json'
  const fawazFallback = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json'

  try {
    let data
    try {
      data = await tryFetch(fawazPrimary)
    } catch {
      data = await tryFetch(fawazFallback)
    }

    if (data?.usd) {
      const rates = {}
      for (const [code, rate] of Object.entries(data.usd)) {
        rates[code.toUpperCase()] = rate
      }
      applyRates(rates)
      return
    }
  } catch { /* fall through */ }

  console.warn('Failed to fetch exchange rates from all providers, using hardcoded fallback values')
}

export const parseCurrency = (input) => {
  // "$30", "€50", "£100"
  const symbolMatch = input.match(/^([€$£¥₹₽])\s*(\d+(?:\.\d+)?)(.*)$/)
  if (symbolMatch) {
    const currency = currencyMap[symbolMatch[1]]
    const value = parseFloat(symbolMatch[2])
    const rest = symbolMatch[3].trim()
    return { value, currency, rest }
  }

  // "100 USD", "50 EUR"
  const codeMatch = input.match(/^(\d+(?:\.\d+)?)\s+([a-zA-Z]+)(.*)$/)
  if (codeMatch) {
    const value = parseFloat(codeMatch[1])
    const code = codeMatch[2].trim()
    const rest = codeMatch[3].trim()
    const currency = currencyMap[code.toLowerCase()] || code.toUpperCase()
    if (exchangeRates.value[currency]) {
      return { value, currency, rest }
    }
  }

  return null
}

export const convertCurrency = (value, fromCurrency, toCurrency) => {
  const fromRate = exchangeRates.value[fromCurrency]
  const toRate = exchangeRates.value[toCurrency]
  if (!fromRate || !toRate) throw new Error('Unknown currency')
  const usd = value / fromRate
  return usd * toRate
}

export const handleCurrencyExpression = (input) => {
  const noResult = { value: 0, currency: null, hasCurrency: false, isConverted: false }

  // "$30 in EUR" or "€50 in USD" or "(a + $4) in GBP"
  const convMatch = input.match(/^(.+?)\s+in\s+([a-zA-Z€$£¥₹₽]+)$/i)
  if (convMatch) {
    const sourceExpr = convMatch[1].trim()
    const targetStr = convMatch[2].trim()
    const targetCurrency = currencyMap[targetStr.toLowerCase()] || targetStr.toUpperCase()

    if (exchangeRates.value[targetCurrency]) {
      const parsed = parseCurrency(sourceExpr)
      if (parsed && !parsed.rest) {
        const converted = convertCurrency(parsed.value, parsed.currency, targetCurrency)
        return { value: converted, currency: targetCurrency, hasCurrency: true, isConverted: true }
      }

      const hasCurrencySymbols = /[€$£¥₹₽]/.test(sourceExpr)
      let hasCurrencyVars = false
      const cvarsInSource = []
      for (const [varName, varVal] of Object.entries(variables.value)) {
        if (varName.startsWith('_')) continue
        if (typeof varVal === 'object' && varVal.currency) {
          const regex = new RegExp(`\\b${varName}\\b`, 'i')
          if (regex.test(sourceExpr)) {
            hasCurrencyVars = true
            cvarsInSource.push({ name: varName, value: varVal.value, currency: varVal.currency })
          }
        }
      }

      if (hasCurrencySymbols || hasCurrencyVars) {
        let expr = sourceExpr
        expr = expr.replace(/([€$£¥₹₽])\s*(\d+(?:\.\d+)?)/g, (_, symbol, num) => {
          const cur = currencyMap[symbol]
          const val = parseFloat(num)
          const usdVal = val / exchangeRates.value[cur]
          return `(${usdVal})`
        })
        for (const cv of cvarsInSource) {
          const regex = new RegExp(`\\b${cv.name}\\b`, 'gi')
          const usdVal = cv.value / exchangeRates.value[cv.currency]
          expr = expr.replace(regex, `(${usdVal})`)
        }
        try {
          const usdResult = evaluateMath(expr)
          const converted = usdResult * exchangeRates.value[targetCurrency]
          return { value: converted, currency: targetCurrency, hasCurrency: true, isConverted: true }
        } catch (e) { /* fall through */ }
      }

      try {
        const value = evaluateMath(sourceExpr)
        const converted = convertCurrency(value, 'USD', targetCurrency)
        return { value: converted, currency: targetCurrency, hasCurrency: true, isConverted: true }
      } catch (e) { /* fall through */ }
    }
  }

  // Currency arithmetic: "$30 + €20"
  const currencyArithMatch = input.match(/^([€$£¥₹₽])\s*(\d+(?:\.\d+)?)\s*([+\-*/])\s*([€$£¥₹₽])\s*(\d+(?:\.\d+)?)$/)
  if (currencyArithMatch) {
    const cur1 = currencyMap[currencyArithMatch[1]]
    const val1 = parseFloat(currencyArithMatch[2])
    const op = currencyArithMatch[3]
    const cur2 = currencyMap[currencyArithMatch[4]]
    const val2 = parseFloat(currencyArithMatch[5])

    const usd1 = val1 / exchangeRates.value[cur1]
    const usd2 = val2 / exchangeRates.value[cur2]
    let result
    if (op === '+') result = usd1 + usd2
    else if (op === '-') result = usd1 - usd2
    else if (op === '*') result = usd1 * usd2
    else if (op === '/') result = usd1 / usd2

    const finalValue = result * exchangeRates.value[cur1]
    return { value: finalValue, currency: cur1, hasCurrency: true, isConverted: false }
  }

  // Simple currency: "$30", "€50"
  const parsed = parseCurrency(input)
  if (parsed && !parsed.rest) {
    return { value: parsed.value, currency: parsed.currency, hasCurrency: true, isConverted: false }
  }

  // Check if expression involves currency variables
  const currencyVarsInExpr = []
  for (const [varName, varVal] of Object.entries(variables.value)) {
    if (varName.startsWith('_')) continue
    if (typeof varVal === 'object' && varVal.currency) {
      const regex = new RegExp(`\\b${varName}\\b`, 'i')
      if (regex.test(input)) {
        currencyVarsInExpr.push({ name: varName, value: varVal.value, currency: varVal.currency })
      }
    }
  }

  const symbolMatches = []
  const symbolRegex = /([€$£¥₹₽])\s*(\d+(?:\.\d+)?)/g
  let sMatch
  while ((sMatch = symbolRegex.exec(input)) !== null) {
    symbolMatches.push({ symbol: sMatch[1], value: parseFloat(sMatch[2]), currency: currencyMap[sMatch[1]] })
  }

  const hasCurrencyContext = currencyVarsInExpr.length > 0 || symbolMatches.length > 0

  if (hasCurrencyContext) {
    const primaryCurrency = currencyVarsInExpr.length > 0
      ? currencyVarsInExpr[0].currency
      : symbolMatches[0].currency

    let expr = input

    expr = expr.replace(/([€$£¥₹₽])\s*(\d+(?:\.\d+)?)/g, (_, symbol, num) => {
      const cur = currencyMap[symbol]
      const val = parseFloat(num)
      const usdVal = val / exchangeRates.value[cur]
      return `(${usdVal})`
    })

    for (const cv of currencyVarsInExpr) {
      const regex = new RegExp(`\\b${cv.name}\\b`, 'gi')
      const usdVal = cv.value / exchangeRates.value[cv.currency]
      expr = expr.replace(regex, `(${usdVal})`)
    }

    try {
      const usdResult = evaluateMath(expr)
      const finalValue = usdResult * exchangeRates.value[primaryCurrency]
      return { value: finalValue, currency: primaryCurrency, hasCurrency: true, isConverted: false }
    } catch (e) { /* fall through */ }
  }

  return noResult
}
