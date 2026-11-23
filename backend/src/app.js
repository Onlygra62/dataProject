import express from 'express';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Fabrica de la app: no abre ningun puerto, asi se puede importar desde las pruebas.
export function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/salud', (_req, res) => {
    res.json({ estado: 'ok' });
  });

  // Siempre al final: primero rutas desconocidas, luego el manejador central de errores.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
