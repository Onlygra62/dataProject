import { AppError, NotFoundError } from '../errors/index.js';

// Todas las respuestas de error usan { detail: "<texto>" }: es lo unico que lee el front.
function sendError(res, statusCode, detail) {
  res.status(statusCode).json({ detail });
}

// Se registra despues de todas las rutas: atrapa lo que ninguna ruta respondio.
export function notFoundHandler(req, _res, next) {
  next(new NotFoundError(`Ruta no encontrada: ${req.method} ${req.path}`));
}

// Se registra al final de todo. Express 5 le pasa tambien los errores de handlers async.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.message);
  }

  // JSON mal formado en el cuerpo de la peticion (lo lanza express.json())
  if (err.type === 'entity.parse.failed') {
    return sendError(res, 400, 'El cuerpo de la peticion no es un JSON valido.');
  }

  // Error inesperado: se registra completo pero al cliente no se le expone nada interno.
  console.error(err);
  return sendError(res, 500, 'Error interno del servidor.');
}
