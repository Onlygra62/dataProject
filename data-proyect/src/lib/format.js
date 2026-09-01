const decimal = new Intl.NumberFormat('es', { maximumFractionDigits: 2 })
const integer = new Intl.NumberFormat('es', { maximumFractionDigits: 0 })

export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  if (typeof value !== 'number') return String(value)
  return Number.isInteger(value) ? integer.format(value) : decimal.format(value)
}

export function formatCount(value) {
  return integer.format(value ?? 0)
}

export function formatPercent(value) {
  if (value === null || value === undefined) return '—'
  if (value > 0 && value < 0.1) return '<0,1 %'
  return `${decimal.format(value)} %`
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${decimal.format(bytes / 1024 ** exponent)} ${units[exponent]}`
}

/** Valor de celda listo para pintar, distinguiendo el vacio del texto "null". */
export function formatCell(value) {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return formatNumber(value)
  return String(value)
}
