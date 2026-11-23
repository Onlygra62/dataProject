import { Router } from 'express';
import { NotFoundError } from '../errors/index.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Solo declara las rutas y que handler responde cada una.
export function createDatasetsRouter({ controller, uploadMiddleware }) {
  const router = Router();

  // Un id que no tiene forma de UUID nunca existe: se responde 404 sin consultar el repositorio.
  router.param('id', (_req, _res, next, id) => {
    next(UUID_PATTERN.test(id) ? undefined : new NotFoundError('Dataset no encontrado.'));
  });

  router.post('/', uploadMiddleware, controller.upload);
  router.get('/:id/preview', controller.preview);
  router.get('/:id/full', controller.full);
  router.get('/:id/summary', controller.summary);

  return router;
}
