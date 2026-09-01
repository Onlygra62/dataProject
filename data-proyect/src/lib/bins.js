/**
 * Agregaciones para las graficas.
 *
 * Todas recorren los valores con bucles en vez de Math.min(...values) o
 * spread: un dataset grande revienta la pila de llamadas con esa forma.
 */

import { formatNumber } from './format'

function extent(values) {
  let min = Infinity
  let max = -Infinity
  for (const value of values) {
    if (value < min) min = value
    if (value > max) max = value
  }
  return [min, max]
}

/** Redondea el ancho de bin al 1/2/5 x 10^n mas cercano, para cortes legibles. */
function niceStep(rough) {
  if (!Number.isFinite(rough) || rough <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const residual = rough / magnitude
  const nice = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10
  return nice * magnitude
}

export function histogram(values, maxBins = 20) {
  if (values.length === 0) return []

  const [min, max] = extent(values)
  if (min === max) {
    return [{ label: formatNumber(min), count: values.length }]
  }

  // Regla de Sturges, acotada para que no queden ni 3 barras ni 60.
  const targetBins = Math.min(maxBins, Math.max(5, Math.ceil(Math.log2(values.length)) + 1))
  const step = niceStep((max - min) / targetBins)
  const start = Math.floor(min / step) * step
  const binCount = Math.max(1, Math.ceil((max + step / 1e6 - start) / step))

  const counts = new Array(binCount).fill(0)
  for (const value of values) {
    const index = Math.min(Math.floor((value - start) / step), binCount - 1)
    counts[index] += 1
  }

  return counts.map((count, index) => ({
    label: `${formatNumber(start + index * step)} – ${formatNumber(start + (index + 1) * step)}`,
    count,
  }))
}

/** Categorias mas frecuentes; el resto se pliega en "Otros" en vez de alargar el eje. */
export function topCategories(values, limit = 12) {
  const counts = new Map()
  for (const value of values) {
    const key = String(value)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  const top = sorted.slice(0, limit).map(([label, count]) => ({ label, count }))

  const restCount = sorted.slice(limit).reduce((total, [, count]) => total + count, 0)
  if (restCount > 0) top.push({ label: 'Otros', count: restCount })

  return top
}

/** Conteo por fecha, agrupando por mes cuando hay demasiados dias distintos. */
export function timeCounts(values, maxPoints = 60) {
  const byDay = new Map()
  for (const value of values) {
    const day = String(value).slice(0, 10)
    byDay.set(day, (byDay.get(day) ?? 0) + 1)
  }

  const source =
    byDay.size <= maxPoints
      ? byDay
      : [...byDay.entries()].reduce((months, [day, count]) => {
          const month = day.slice(0, 7)
          months.set(month, (months.get(month) ?? 0) + count)
          return months
        }, new Map())

  return [...source.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, count }))
}

/** Elige la agregacion segun el tipo inferido de la columna. */
export function buildDistribution(kind, values) {
  if (values.length === 0) return { type: 'empty', points: [] }
  if (kind === 'numeric') return { type: 'histogram', points: histogram(values) }
  if (kind === 'datetime') return { type: 'timeline', points: timeCounts(values) }
  return { type: 'categories', points: topCategories(values) }
}
