/**
 * Perfilado de datasets en el cliente.
 *
 * El backend expone las filas crudas en /datasets/{id}/full, asi que las
 * estadisticas se calculan aqui a partir de esos registros.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?/

export function isBlank(value) {
  return value === null || value === undefined || value === ''
}

function inferKind(values) {
  if (values.length === 0) return 'empty'

  let allNumbers = true
  let allBooleans = true
  let allDates = true

  for (const value of values) {
    if (typeof value !== 'boolean') allBooleans = false
    if (typeof value !== 'number' || Number.isNaN(value)) allNumbers = false
    if (typeof value !== 'string' || !ISO_DATE.test(value)) allDates = false
    if (!allNumbers && !allBooleans && !allDates) break
  }

  if (allBooleans) return 'boolean'
  if (allNumbers) return 'numeric'
  if (allDates) return 'datetime'
  return 'categorical'
}

function numericStats(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const count = sorted.length
  const mean = values.reduce((total, value) => total + value, 0) / count
  // Varianza muestral (n-1), igual que el std por defecto de pandas.
  const variance =
    count > 1
      ? values.reduce((total, value) => total + (value - mean) ** 2, 0) / (count - 1)
      : 0
  const middle = Math.floor(count / 2)

  return {
    min: sorted[0],
    max: sorted[count - 1],
    mean,
    median: count % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2,
    std: Math.sqrt(variance),
  }
}

function mostFrequent(values) {
  const counts = new Map()
  for (const value of values) {
    const key = String(value)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  let top = null
  let topCount = 0
  for (const [key, count] of counts) {
    if (count > topCount) {
      top = key
      topCount = count
    }
  }
  return { top, topCount, unique: counts.size }
}

function profileColumn(name, rows) {
  const values = []
  let nulls = 0

  for (const row of rows) {
    const value = row[name]
    if (isBlank(value)) nulls += 1
    else values.push(value)
  }

  const kind = inferKind(values)
  const { top, topCount, unique } = mostFrequent(values)

  const column = {
    name,
    kind,
    nulls,
    nullPct: rows.length ? (nulls / rows.length) * 100 : 0,
    unique,
    min: null,
    max: null,
    mean: null,
    median: null,
    std: null,
    top: null,
    topCount: null,
  }

  if (values.length === 0) return column

  if (kind === 'numeric') {
    Object.assign(column, numericStats(values))
  } else if (kind === 'datetime') {
    const sorted = [...values].sort()
    column.min = sorted[0]
    column.max = sorted[sorted.length - 1]
  } else {
    column.top = top
    column.topCount = topCount
  }

  return column
}

function countDuplicateRows(rows, columns) {
  const seen = new Set()
  let duplicates = 0

  for (const row of rows) {
    const key = JSON.stringify(columns.map((column) => row[column] ?? null))
    if (seen.has(key)) duplicates += 1
    else seen.add(key)
  }
  return duplicates
}

/** Construye el perfil completo del dataset a partir de las filas del backend. */
export function profileDataset(rows) {
  const columns = rows.length > 0 ? Object.keys(rows[0]) : []
  const columnProfiles = columns.map((name) => profileColumn(name, rows))

  return {
    rowCount: rows.length,
    columnCount: columns.length,
    columns,
    columnProfiles,
    totalNulls: columnProfiles.reduce((total, column) => total + column.nulls, 0),
    duplicateRows: countDuplicateRows(rows, columns),
    totalCells: rows.length * columns.length,
  }
}
