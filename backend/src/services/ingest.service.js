import path from 'node:path';
import { parse as parseCsv } from 'csv-parse/sync';
import { readSheet } from 'read-excel-file/node';
import { BadRequestError, FormatoInvalidoError } from '../errors/index.js';

// Extensiones aceptadas (sin distinguir mayusculas). Tambien las usa el middleware de subida.
export const SUPPORTED_EXTENSIONS = ['.csv', '.xlsx'];

const BOOLEAN_TOKENS = new Map([
  ['true', true],
  ['false', false],
]);
const NUMBER_PATTERN = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
// Textos que se leen como celda vacia (igual que hace pandas por defecto).
const EMPTY_TOKENS = new Set(['', 'na', 'n/a', '#n/a', 'nan', 'null', 'none', '<na>']);

const isEmptyText = (text) => EMPTY_TOKENS.has(text.trim().toLowerCase());
const isNumberText = (text) => NUMBER_PATTERN.test(text.trim());
const isBooleanText = (text) => BOOLEAN_TOKENS.has(text.trim().toLowerCase());

function getExtension(filename) {
  return path.extname(filename ?? '').toLowerCase();
}

export function isSupportedFile(filename) {
  return SUPPORTED_EXTENSIONS.includes(getExtension(filename));
}

// El CSV llega todo como texto: se decide el tipo por columna. Si todos los valores no
// vacios son numeros la columna es numerica, si todos son true/false es booleana y en
// cualquier otro caso se queda como texto.
function convertColumn(texts) {
  const filled = texts.filter((text) => !isEmptyText(text));

  if (filled.length > 0 && filled.every(isNumberText)) {
    return texts.map((text) => (isEmptyText(text) ? null : Number(text.trim())));
  }
  if (filled.length > 0 && filled.every(isBooleanText)) {
    return texts.map((text) => (isEmptyText(text) ? null : BOOLEAN_TOKENS.get(text.trim().toLowerCase())));
  }
  return texts.map((text) => (isEmptyText(text) ? null : text));
}

// Convierte una matriz [encabezados, ...filas] en una lista de objetos { columna: valor }.
function matrixToRows(matrix, convertCells) {
  const [headerRow, ...bodyRows] = matrix;
  if (!headerRow || bodyRows.length === 0) {
    throw new BadRequestError('El archivo no tiene datos: se necesita una fila de encabezados y al menos una fila.');
  }

  const columns = headerRow.map((name, index) => String(name ?? '').trim() || `Unnamed: ${index}`);

  for (const row of bodyRows) {
    if (row.length > columns.length) {
      throw new BadRequestError('El archivo esta mal formado: hay filas con mas celdas que encabezados.');
    }
  }

  const columnValues = columns.map((_, index) => convertCells(bodyRows.map((row) => row[index] ?? null)));

  return bodyRows.map((_, rowIndex) =>
    Object.fromEntries(columns.map((name, columnIndex) => [name, columnValues[columnIndex][rowIndex]])),
  );
}

function parseCsvBuffer(buffer) {
  let matrix;
  try {
    matrix = parseCsv(buffer, { bom: true, skip_empty_lines: true, relax_column_count: true });
  } catch {
    throw new BadRequestError('No se pudo leer el archivo CSV: esta corrupto o mal formado.');
  }
  return matrixToRows(matrix, (cells) => convertColumn(cells.map((cell) => cell ?? '')));
}

async function parseXlsxBuffer(buffer) {
  let matrix;
  try {
    matrix = await readSheet(buffer);
  } catch {
    throw new BadRequestError('No se pudo leer el archivo XLSX: esta corrupto o no es un Excel valido.');
  }
  // Excel ya entrega los valores tipados (numero, texto, booleano, fecha): no se re-interpretan.
  return matrixToRows(matrix, (cells) => cells.map((cell) => (cell === undefined ? null : cell)));
}

// Recibe el archivo subido ({ originalname, buffer }) y devuelve sus filas como objetos.
export async function parseDataset({ originalname, buffer }) {
  const extension = getExtension(originalname);

  if (extension === '.csv') return parseCsvBuffer(buffer);
  if (extension === '.xlsx') return parseXlsxBuffer(buffer);
  throw new FormatoInvalidoError();
}
