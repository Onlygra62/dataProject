import { BadRequestError } from '../errors/index.js';
import { UPLOAD_FIELD } from '../middleware/upload.js';

// Capa HTTP: lee la peticion, llama al servicio y arma la respuesta. No calcula nada.
export function createDatasetsController({ datasetsService }) {
  return {
    async upload(req, res) {
      if (!req.file) {
        throw new BadRequestError(`Falta el archivo: envialo en el campo "${UPLOAD_FIELD}".`);
      }
      const datasetId = await datasetsService.create(req.file);
      res.status(201).json({ dataset_id: datasetId });
    },

    preview(req, res) {
      res.json(datasetsService.getPreview(req.params.id));
    },

    full(req, res) {
      res.json(datasetsService.getFull(req.params.id));
    },

    summary(req, res) {
      res.json({ dataset_id: req.params.id, columnas: datasetsService.getSummary(req.params.id) });
    },
  };
}
