import 'dotenv/config';

const DEFAULT_PORT = 8000;
const DEFAULT_MAX_UPLOAD_MB = 50;
const DEFAULT_RATE_LIMIT_MAX = 100;
// Origen del front en desarrollo (Vite).
const DEFAULT_CORS_ORIGIN = 'http://localhost:5173,http://127.0.0.1:5173';

function readPositiveNumber(name, value, fallback) {
  const number = Number(value ?? fallback);
  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`${name} invalido: "${value}". Debe ser un numero mayor que 0.`);
  }
  return number;
}

function readPositiveInteger(name, value, fallback, max = Number.MAX_SAFE_INTEGER) {
  const number = readPositiveNumber(name, value, fallback);
  if (!Number.isInteger(number) || number > max) {
    throw new Error(`${name} invalido: "${value}". Debe ser un entero entre 1 y ${max}.`);
  }
  return number;
}

// Lista separada por comas. Cada origen se normaliza (sin barra final) porque el navegador
// envia el header Origin sin ella y la comparacion es exacta.
function readOrigins(name, value, fallback) {
  const origins = (value ?? fallback)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
      try {
        return new URL(origin).origin;
      } catch {
        throw new Error(`${name} invalido: "${origin}" no es una URL (ejemplo: https://mi-sitio.com).`);
      }
    });

  if (origins.length === 0) {
    throw new Error(`${name} no puede estar vacio.`);
  }
  return origins;
}

export const config = Object.freeze({
  port: readPositiveInteger('PORT', process.env.PORT, DEFAULT_PORT, 65535),
  maxUploadMb: readPositiveNumber('MAX_UPLOAD_MB', process.env.MAX_UPLOAD_MB, DEFAULT_MAX_UPLOAD_MB),
  corsOrigins: readOrigins('CORS_ORIGIN', process.env.CORS_ORIGIN, DEFAULT_CORS_ORIGIN),
  rateLimitMax: readPositiveInteger('RATE_LIMIT_MAX', process.env.RATE_LIMIT_MAX, DEFAULT_RATE_LIMIT_MAX),
});
