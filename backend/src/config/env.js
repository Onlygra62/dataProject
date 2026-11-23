import 'dotenv/config';

const DEFAULT_PORT = 8000;

function readPort(value) {
  const port = Number(value ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT invalido: "${value}". Debe ser un entero entre 1 y 65535.`);
  }
  return port;
}

export const config = Object.freeze({
  port: readPort(process.env.PORT),
});
