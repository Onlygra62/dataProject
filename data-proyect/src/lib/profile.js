/**
 * Perfilado de datasets en el cliente.
 *
 * El backend entrega las filas crudas (/datasets/{id}/full) y las estadisticas de las
 * columnas numericas (/datasets/{id}/summary). Aqui se calcula lo que el backend no
 * ofrece (tipos, vacios, unicos, duplicados) y se combina con esas estadisticas, para
 * no repetir en el cliente la media, el minimo o el maximo.
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

/** Traduce las estadisticas del backend (en espanol) a los campos del perfil. */
function fromBackendStats(stats) {
  return {
    min: stats.minimo,
    max: stats.maximo,
    mean: stats.media,
    median: stats.mediana,
    std: stats.desviacion_estandar,
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

function profileColumn(name, rows, backendStats) {
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
    // Si el backend no entrego estadisticas para la columna, quedan en null (se muestran como "—").
    if (backendStats) Object.assign(column, fromBackendStats(backendStats))
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

/**
 * Construye el perfil completo del dataset.
 * @param {object[]} rows - filas del backend.
 * @param {object} numericStats - `columnas` de /summary: estadisticas por columna numerica.
 */
export function profileDataset(rows, numericStats = {}) {
  const columns = rows.length > 0 ? Object.keys(rows[0]) : []
  const columnProfiles = columns.map((name) => profileColumn(name, rows, numericStats[name]))

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
