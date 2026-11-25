import { readFileSync } from 'node:fs';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { createDatasetRepository } from '../src/repositories/datasetRepository.js';

const fixture = readFileSync(new URL('./fixtures/data.csv', import.meta.url));
// Una app nueva (con repositorio vacio) por prueba, para que no dependan entre si.
const newApp = (options = {}) => createApp({ repository: createDatasetRepository(), ...options });

async function upload(app) {
  return request(app).post('/datasets').attach('file', fixture, 'data.csv');
}

describe('API de datasets', () => {
  it('GET /salud responde ok', async () => {
    const res = await request(newApp()).get('/salud');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ estado: 'ok' });
  });

  it('POST /datasets sube un CSV y devuelve un dataset_id', async () => {
    const res = await upload(newApp());
    expect(res.status).toBe(201);
    expect(res.body.dataset_id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('GET preview devuelve solo 5 filas y summary las estadisticas', async () => {
    const app = newApp();
    const { body } = await upload(app);

    const preview = await request(app).get(`/datasets/${body.dataset_id}/preview`);
    expect(preview.status).toBe(200);
    expect(preview.body).toHaveLength(5);

    const summary = await request(app).get(`/datasets/${body.dataset_id}/summary`);
    expect(summary.status).toBe(200);
    expect(summary.body.columnas.Duration).toHaveProperty('media');
  });

  it('un dataset inexistente responde 404 con { detail }', async () => {
    const res = await request(newApp()).get('/datasets/00000000-0000-4000-8000-000000000000/full');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('detail');
  });

  it('subir un formato no soportado responde 400', async () => {
    const res = await request(newApp()).post('/datasets').attach('file', Buffer.from('hola'), 'notas.txt');
    expect(res.status).toBe(400);
  });

  it('un archivo que supera MAX_UPLOAD_MB responde 413', async () => {
    const res = await request(newApp({ maxUploadMb: 0.0001 })).post('/datasets').attach('file', fixture, 'data.csv');
    expect(res.status).toBe(413);
  });

  it('CORS no autoriza origenes ajenos', async () => {
    const res = await request(newApp()).get('/salud').set('Origin', 'http://evil.com');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('el limite de peticiones responde 429', async () => {
    const app = newApp({ rateLimitMax: 2 });
    await request(app).get('/salud');
    await request(app).get('/salud');
    expect((await request(app).get('/salud')).status).toBe(429);
  });
});