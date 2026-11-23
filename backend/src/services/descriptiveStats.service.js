import { BadRequestError } from '../errors/index.js';

// Estadisticas descriptivas por columna numerica. Mantiene la misma semantica que tenia
// el backend en Python (pandas/numpy), para que los resultados no cambien:
//   - varianza muestral (divide entre n - 1)
//   - percentiles con interpolacion lineal
//   - moda: todos los valores con la maxima frecuencia, o [] si ninguno se repite

const PERCENTILES = { q1: 25, q2: 50, q3: 75 };

const sum = (values) => values.reduce((total, value) => total + value, 0);

// Percentil p (0-100) de una lista YA ordenada, interpolando entre los dos vecinos.
function percentile(sorted, p) {
  if (sorted.length === 1) return sorted[0];
  const position = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(position);
  const upper = Math.min(lower + 1, sorted.length - 1);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function mode(values) {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);

  const maxCount = Math.max(...counts.values());
  if (maxCount === 1) return [];
  return [...counts].filter(([, count]) => count === maxCount).map(([value]) => value).sort((a, b) => a - b);
}

function describeColumn(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const media = sum(sorted) / n;
  const varianza = n > 1 ? sum(sorted.map((value) => (value - media) ** 2)) / (n - 1) : 0;
  const desviacion = Math.sqrt(varianza);
  const { q1, q2, q3 } = Object.fromEntries(
    Object.entries(PERCENTILES).map(([name, p]) => [name, percentile(sorted, p)]),
  );

  return {
    media,
    mediana: q2,
    moda: mode(sorted),
    varianza,
    desviacion_estandar: desviacion,
    minimo: sorted[0],
    maximo: sorted[n - 1],
    q1,
    q2,
    q3,
    iqr: q3 - q1,
    coeficiente_variacion: media !== 0 ? (desviacion / media) * 100 : null,
  };
}

// Valores no vacios de una columna, o null si la columna no es numerica
// (numerica = tiene datos y todos son numeros finitos; los booleanos no cuentan).
function numericValues(rows, column) {
  const values = rows.map((row) => row[column]).filter((value) => value !== null && value !== undefined);
  const isNumeric = values.length > 0 && values.every((value) => typeof value === 'number' && Number.isFinite(value));
  return isNumeric ? values : null;
}

// Devuelve { columna: estadisticas } solo para las columnas numericas ({} si no hay ninguna).
export function computeDescriptive(rows) {
  if (rows.length === 0) return {};

  const stats = {};
  for (const column of Object.keys(rows[0])) {
    const values = numericValues(rows, column);
    if (values) stats[column] = describeColumn(values);
  }
  return stats;
}

// Version para el endpoint: un dataset sin columnas numericas es un error del cliente (400).
export function summarizeDataset(rows) {
  const columns = computeDescriptive(rows);
  if (Object.keys(columns).length === 0) {
    throw new BadRequestError('El dataset no tiene columnas numericas para analizar.');
  }
  return columns;
}
