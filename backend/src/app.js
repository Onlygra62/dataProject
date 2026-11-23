import express from 'express';

// Fabrica de la app: no abre ningun puerto, asi se puede importar desde las pruebas.
export function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/salud', (_req, res) => {
    res.json({ estado: 'ok' });
  });

  return app;
}
