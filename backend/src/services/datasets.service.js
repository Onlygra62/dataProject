import { summarizeDataset } from './descriptiveStats.service.js';
import { parseDataset } from './ingest.service.js';
import { serializeRows } from './serialization.js';

export const PREVIEW_ROWS = 5;

// Casos de uso sobre datasets. Une ingesta, estadisticas y repositorio; no sabe nada de HTTP.
export function createDatasetsService({ repository }) {
  return {
    async create(file) {
      const rows = await parseDataset(file);
      return repository.save(rows);
    },

    getPreview(id) {
      return serializeRows(repository.getOrThrow(id).slice(0, PREVIEW_ROWS));
    },

    getFull(id) {
      return serializeRows(repository.getOrThrow(id));
    },

    getSummary(id) {
      return summarizeDataset(repository.getOrThrow(id));
    },
  };
}
