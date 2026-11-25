import { describe, expect, it } from 'vitest';
import { BadRequestError } from '../src/errors/index.js';
import { computeDescriptive, summarizeDataset } from '../src/services/descriptiveStats.service.js';

// Columna conocida: 2, 4, 4, 4, 5, 5, 7, 9 -> media 5, varianza muestral 32/7
const rows = [2, 4, 4, 4, 5, 5, 7, 9].map((valor) => ({ valor, nombre: 'x' }));

describe('estadisticas descriptivas', () => {
  it('calcula media, mediana y moda', () => {
    const { valor } = computeDescriptive(rows);
    expect(valor.media).toBe(5);
    expect(valor.mediana).toBe(4.5);
    expect(valor.moda).toEqual([4]);
  });

  it('usa varianza muestral (n - 1) y su desviacion estandar', () => {
    const { valor } = computeDescriptive(rows);
    expect(valor.varianza).toBeCloseTo(32 / 7, 10);
    expect(valor.desviacion_estandar).toBeCloseTo(Math.sqrt(32 / 7), 10);
  });

  it('calcula cuartiles, IQR y rango', () => {
    const { valor } = computeDescriptive(rows);
    expect(valor.q1).toBe(4);
    expect(valor.q3).toBe(5.5);
    expect(valor.iqr).toBe(1.5);
    expect([valor.minimo, valor.maximo]).toEqual([2, 9]);
  });

  it('ignora las columnas que no son numericas', () => {
    expect(Object.keys(computeDescriptive(rows))).toEqual(['valor']);
  });

  it('lanza BadRequestError si no hay columnas numericas', () => {
    expect(() => summarizeDataset([{ nombre: 'a' }, { nombre: 'b' }])).toThrow(BadRequestError);
  });
});