// Deja las filas listas para convertirse en JSON sin sorpresas:
//   - celdas vacias (undefined) y numeros no finitos (NaN, Infinity) -> null
//   - fechas -> texto ISO 8601 (una fecha invalida -> null)
// Lo usan los endpoints antes de responder, para que el front siempre reciba el mismo formato.

export function serializeValue(value) {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === 'number' && !Number.isFinite(value)) return null;
  return value;
}

export function serializeRows(rows) {
  return rows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([column, value]) => [column, serializeValue(value)])),
  );
}
