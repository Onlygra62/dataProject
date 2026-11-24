import { describe, expect, it } from 'vitest';
import { BadRequestError, FormatoInvalidoError } from '../src/errors/index.js';
import { isSupportedFile, parseDataset } from '../src/services/ingest.service.js';

const csv = (text) => ({ originalname: 'datos.csv', buffer: Buffer.from(text) });

describe('ingesta de archivos', () => {
  it('lee un CSV y detecta columnas numericas y de texto', async () => {
    const rows = await parseDataset(csv('nombre,edad\nAna,30\nLuis,25\n'));
    expect(rows).toEqual([
      { nombre: 'Ana', edad: 30 },
      { nombre: 'Luis', edad: 25 },
    ]);
  });

  it('convierte celdas vacias en null', async () => {
    const rows = await parseDataset(csv('a,b\n1,\n2,5\n'));
    expect(rows[0].b).toBeNull();
    expect(rows[1].b).toBe(5);
  });

  it('acepta .csv y .xlsx sin distinguir mayusculas y rechaza otros formatos', () => {
    expect(isSupportedFile('DATOS.CSV')).toBe(true);
    expect(isSupportedFile('hoja.xlsx')).toBe(true);
    expect(isSupportedFile('notas.txt')).toBe(false);
  });

  it('lanza FormatoInvalidoError con una extension no soportada', async () => {
    await expect(parseDataset({ originalname: 'a.txt', buffer: Buffer.from('x') })).rejects.toThrow(
      FormatoInvalidoError,
    );
  });

  it('rechaza un archivo sin filas de datos', async () => {
    await expect(parseDataset(csv('solo,encabezados\n'))).rejects.toThrow(BadRequestError);
  });
});