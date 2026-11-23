import 'dotenv/config';

const DEFAULT_PORT = 8000;
const DEFAULT_MAX_UPLOAD_MB = 50;

function readPositiveNumber(name, value, fallback) {
  const number = Number(value ?? fallback);
  if (!Number.isFinite(number) || number <= 0) {
    throw new Error(`${name} invalido: "${value}". Debe ser un numero mayor que 0.`);
  }
  return number;
}

function readPort(value) {
  const port = readPositiveNumber('PORT', value, DEFAULT_PORT);
  if (!Number.isInteger(port) || port > 65535) {
    throw new Error(`PORT invalido: "${value}". Debe ser un entero entre 1 y 65535.`);
  }
  return port;
}

export const config = Object.freeze({
  port: readPort(process.env.PORT),
  maxUploadMb: readPositiveNumber('MAX_UPLOAD_MB', process.env.MAX_UPLOAD_MB, DEFAULT_MAX_UPLOAD_MB),
});
