import express from 'express';
import { config } from './config/env.js';
import { createDatasetsController } from './controllers/datasets.controller.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { createUploadMiddleware } from './middleware/upload.js';
import { createDatasetRepository } from './repositories/datasetRepository.js';
import { createDatasetsRouter } from './routes/datasets.routes.js';
import { createDatasetsService } from './services/datasets.service.js';

// Fabrica de la app: no abre ningun puerto, asi se puede importar desde las pruebas.
// Las dependencias se pueden reemplazar (por ejemplo, un repositorio nuevo en cada prueba).
export function createApp({ repository = createDatasetRepository(), maxUploadMb = config.maxUploadMb } = {}) {
  const app = express();

  const datasetsService = createDatasetsService({ repository });
  const datasetsController = createDatasetsController({ datasetsService });
  const uploadMiddleware = createUploadMiddleware({ maxUploadMb });

  app.use(express.json());

  app.get('/salud', (_req, res) => {
    res.json({ estado: 'ok' });
  });
  app.use('/datasets', createDatasetsRouter({ controller: datasetsController, uploadMiddleware }));

  // Siempre al final: primero rutas desconocidas, luego el manejador central de errores.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
