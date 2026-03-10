// Unit conversion logic
import { unitConversions, variables } from './constants'
import { SCALE_SUFFIX, SCALED_NUM_RE, applyScale } from './scales'
import { evaluateMath } from './math'

export const findUnitCategory = (unitName) => {
  const lower = unitName.toLowerCase()

  // Check for square/cubic prefixes first
  const sqMatch = lower.match(/^(sq|square)\s+(.+)$/)
  if (sqMatch) {
    const baseUnit = sqMatch[2]
    const areaKey = `square ${baseUnit}`
    const sqKey = `sq ${baseUnit}`
    if (unitConversions.area[areaKey]) return { category: 'area', unit: areaKey, factor: unitConversions.area[areaKey] }
    if (unitConversions.area[sqKey]) return { category: 'area', unit: sqKey, factor: unitConversions.area[sqKey] }
    // Try to derive from length
    const lengthFactor = unitConversions.length[baseUnit]
    if (lengthFactor !== undefined) {
      return { category: 'area', unit: sqKey, factor: lengthFactor * lengthFactor }
    }
  }

  const cuMatch = lower.match(/^(cu|cubic)\s+(.+)$/)
  if (cuMatch) {
    const baseUnit = cuMatch[2]
    const cuKey = `cu ${baseUnit}`
    const cubicKey = `cubic ${baseUnit}`
    if (unitConversions.volume[cuKey]) return { category: 'volume', unit: cuKey, factor: unitConversions.volume[cuKey] }
    if (unitConversions.volume[cubicKey]) return { category: 'volume', unit: cubicKey, factor: unitConversions.volume[cubicKey] }
    // Derive from length
    const lengthFactor = unitConversions.length[baseUnit]
    if (lengthFactor !== undefined) {
      return { category: 'volume', unit: cuKey, factor: lengthFactor * lengthFactor * lengthFactor * 1000 }
    }
  }

  // Check cbm (cubic meter)
  if (lower === 'cbm') return { category: 'volume', unit: 'cbm', factor: 1000 }

  // Check multi-word units first (square inches, cubic meters, etc.)
  for (const [category, units] of Object.entries(unitConversions)) {
    if (category === 'temperature') continue
    if (units[lower] !== undefined) return { category, unit: lower, factor: units[lower] }
  }

  // Case-sensitive check for data units (KB, MB, GB, etc.)
  if (unitConversions.data[unitName] !== undefined) {
    return { category: 'data', unit: unitName, factor: unitConversions.data[unitName] }
  }

  return null
}

export const convertTemperature = (value, fromUnit, toUnit) => {
  const from = unitConversions.temperature[fromUnit.toLowerCase()]
  const to = unitConversions.temperature[toUnit.toLowerCase()]
  if (!from || !to) return null

  // Convert to Celsius first
  let celsius
  if (from === 'C') celsius = value
  else if (from === 'F') celsius = (value - 32) * 5 / 9
  else if (from === 'K') celsius = value - 273.15

  // Convert from Celsius to target
  if (to === 'C') return celsius
  if (to === 'F') return celsius * 9 / 5 + 32
  if (to === 'K') return celsius + 273.15
}

// Parse a unit expression that may contain arithmetic (e.g., "1 km + 500 m")
// Returns value in base unit of the given category, or null
export const parseUnitExpression = (expr, category) => {
  // Try compound units first: "1 meter 20 cm"
  const compoundPattern = /(\d+(?:\.\d+)?)\s+([\w]+(?:\s+[\w]+)?)\s+(\d+(?:\.\d+)?)\s+([\w]+(?:\s+[\w]+)?)/i
  const compoundMatch = expr.match(compoundPattern)
  if (compoundMatch) {
    const val1 = parseFloat(compoundMatch[1])
    const unit1 = compoundMatch[2].trim()
    const val2 = parseFloat(compoundMatch[3])
    const unit2 = compoundMatch[4].trim()
    const info1 = findUnitCategory(unit1)
    const info2 = findUnitCategory(unit2)
    if (info1 && info2 && info1.category === category && info2.category === category) {
      return val1 * info1.factor + val2 * info2.factor
    }
  }

  // Try simple "N unit" first (with optional scale: "2k km", "1.5M meters")
  const simpleRe = new RegExp(`^${SCALED_NUM_RE}\\s+(.+)$`)
  const simpleMatch = expr.match(simpleRe)
  if (simpleMatch) {
    const value = applyScale(simpleMatch[1], simpleMatch[2])
    const unitStr = simpleMatch[3].trim()
    const unitInfo = findUnitCategory(unitStr)
    if (unitInfo && unitInfo.category === category) {
      return value * unitInfo.factor
    }
  }

  // Try arithmetic: "1 km + 500 m", "2 ft - 3 inches"
  const parts = expr.split(/\s*([+-])\s*/)
  if (parts.length >= 3) {
    let total = null
    let op = '+'
    for (const part of parts) {
      if (part === '+' || part === '-') { op = part; continue }
      const partRe = new RegExp(`^${SCALED_NUM_RE}\\s+(.+)$`)
      const m = part.trim().match(partRe)
      if (m) {
        const val = applyScale(m[1], m[2])
        const unitStr = m[3].trim()
        const unitInfo = findUnitCategory(unitStr)
        if (unitInfo && unitInfo.category === category) {
          const baseVal = val * unitInfo.factor
          if (total === null) total = baseVal
          else total = op === '+' ? total + baseVal : total - baseVal
        } else {
          return null
        }
      } else {
        try {
          const val = evaluateMath(part.trim())
          if (total === null) total = val
          else total = op === '+' ? total + val : total - val
        } catch (e) { return null }
      }
    }
    return total
  }

  // Try evaluating as pure math
  try {
    return evaluateMath(expr)
  } catch (e) { return null }
}

// Parse compound units like "1 meter 20 cm"
export const parseCompoundUnits = (input) => {
  const pattern = /(\d+(?:\.\d+)?)\s+([\w]+(?:\s+[\w]+)?)\s+(\d+(?:\.\d+)?)\s+([\w]+(?:\s+[\w]+)?)/i
  const match = input.match(pattern)
  if (!match) return null

  const val1 = parseFloat(match[1])
  const unit1 = match[2].trim()
  const val2 = parseFloat(match[3])
  const unit2 = match[4].trim()

  const info1 = findUnitCategory(unit1)
  const info2 = findUnitCategory(unit2)

  if (info1 && info2 && info1.category === info2.category) {
    const baseTotal = val1 * info1.factor + val2 * info2.factor
    const smallerFactor = Math.min(info1.factor, info2.factor)
    const smallerUnit = info1.factor < info2.factor ? unit1 : unit2
    const result = baseTotal / smallerFactor
    return { value: result, unit: smallerUnit, hasUnit: true, isConverted: true }
  }

  return null
}

// CSS bridge: convert between length units and CSS pixels using ppi
export const isCSSBridgeConversion = (sourceExpr, targetUnit) => {
  const cssUnits = ['px', 'pixel', 'pixels', 'pt', 'point', 'points', 'em', 'rem']
  const lengthUnits = Object.keys(unitConversions.length)
  const targetLower = targetUnit.toLowerCase()

  const sourceUnit = sourceExpr.match(/\d+(?:\.\d+)?\s+(.+)/)?.[1]?.trim()?.toLowerCase()
  if (!sourceUnit) return false

  return (cssUnits.includes(targetLower) && lengthUnits.includes(sourceUnit)) ||
         (lengthUnits.includes(targetLower) && cssUnits.includes(sourceUnit))
}

export const handleCSSBridge = (sourceExpr, targetUnit) => {
  const ppi = variables.value._ppi || 96 // default 96 ppi
  const targetLower = targetUnit.toLowerCase()

  const srcRe = new RegExp(`^${SCALED_NUM_RE}\\s+(.+)$`)
  const srcMatch = sourceExpr.match(srcRe)
  if (!srcMatch) return null

  const value = applyScale(srcMatch[1], srcMatch[2])
  const srcUnit = srcMatch[3].trim().toLowerCase()

  const lengthUnits = unitConversions.length
  const cssUnits = unitConversions.css

  if (lengthUnits[srcUnit] !== undefined && (targetLower === 'px' || targetLower === 'pixel' || targetLower === 'pixels')) {
    const inches = value * lengthUnits[srcUnit] / 0.0254
    const px = inches * ppi
    return { value: px, unit: targetUnit, hasUnit: true, isConverted: true }
  }

  if (cssUnits[srcUnit] !== undefined && cssUnits[targetLower] !== undefined) {
    const px = value * cssUnits[srcUnit]
    const result = px / cssUnits[targetLower]
    return { value: result, unit: targetUnit, hasUnit: true, isConverted: true }
  }

  return null
}

export const handleUnitExpression = (input) => {
  const noResult = { value: 0, unit: null, hasUnit: false, isConverted: false }

  // Normalize square/cubic prefixes in input
  let normalized = input
    .replace(/\bsquare\s+/gi, 'square ')
    .replace(/\bcubic\s+/gi, 'cubic ')
    .replace(/\bsq\s+/gi, 'sq ')
    .replace(/\bcu\s+/gi, 'cu ')
    .replace(/(\d)°/g, '$1 °')

  // Check for "X unit in/to/as Y unit" pattern
  const convMatch = normalized.match(/^(.+?)\s+(?:in|to|as)\s+(.+)$/i)
  if (convMatch) {
    const sourceExpr = convMatch[1].trim()
    const targetUnitStr = convMatch[2].trim()

    const targetInfo = findUnitCategory(targetUnitStr)

    // Temperature special case
    if (unitConversions.temperature[targetUnitStr.toLowerCase()]) {
      const srcTempRe = new RegExp(`^${SCALED_NUM_RE}\\s+(.+)$`)
      const srcMatch = sourceExpr.match(srcTempRe)
      if (srcMatch) {
        const value = applyScale(srcMatch[1], srcMatch[2])
        const srcUnit = srcMatch[3].trim()
        if (unitConversions.temperature[srcUnit.toLowerCase()]) {
          const result = convertTemperature(value, srcUnit, targetUnitStr)
          if (result !== null) return { value: result, unit: targetUnitStr, hasUnit: true, isConverted: true }
        }
      }
    }

    if (targetInfo) {
      if (targetInfo.category === 'css' || isCSSBridgeConversion(sourceExpr, targetUnitStr)) {
        const bridgeResult = handleCSSBridge(sourceExpr, targetUnitStr)
        if (bridgeResult) return bridgeResult
      }

      const sourceValue = parseUnitExpression(sourceExpr, targetInfo.category)
      if (sourceValue !== null) {
        const result = sourceValue / targetInfo.factor
        return { value: result, unit: targetUnitStr, hasUnit: true, isConverted: true }
      }
    }

    const bridgeResult = handleCSSBridge(sourceExpr, targetUnitStr)
    if (bridgeResult) return bridgeResult
  }

  // Compound unit expression: "1 meter 20 cm"
  const compoundResult = parseCompoundUnits(normalized)
  if (compoundResult) return compoundResult

  // Simple "N unit" (no conversion), with optional scale
  const simpleEndRe = new RegExp(`^${SCALED_NUM_RE}\\s+(.+)$`)
  const simpleMatch = normalized.match(simpleEndRe)
  if (simpleMatch) {
    const value = applyScale(simpleMatch[1], simpleMatch[2])
    const unitStr = simpleMatch[3].trim()
    const unitInfo = findUnitCategory(unitStr)
    if (unitInfo) {
      return { value, unit: unitStr, hasUnit: true, isConverted: false }
    }
  }

  return noResult
}
