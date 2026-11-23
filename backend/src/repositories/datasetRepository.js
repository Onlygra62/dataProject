import { randomUUID } from 'node:crypto';
import { NotFoundError } from '../errors/index.js';

// Repositorio de datasets: unico lugar que sabe donde se guardan las filas.
// Esta implementacion usa memoria (se pierde al reiniciar el servidor). Para pasar a S3
// u otro almacenamiento basta con crear otra fabrica con los mismos metodos:
//   save(rows)     -> id del dataset guardado
//   getOrThrow(id) -> filas del dataset, o NotFoundError si no existe
export function createDatasetRepository() {
  const datasets = new Map();

  return {
    save(rows) {
      const id = randomUUID();
      datasets.set(id, rows);
      return id;
    },

    getOrThrow(id) {
      const rows = datasets.get(id);
      if (rows === undefined) {
        throw new NotFoundError(
          'Dataset no encontrado. Los datasets viven en memoria y se pierden al reiniciar el servidor.',
        );
      }
      return rows;
    },
  };
}
