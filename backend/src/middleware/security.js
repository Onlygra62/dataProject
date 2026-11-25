import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { TooManyRequestsError } from '../errors/index.js';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;

// CORS restringido: solo los origenes de la lista pueden leer las respuestas desde un navegador.
// Las peticiones sin header Origin (curl, otros servidores) no pasan por CORS y no se ven afectadas.
export function createCorsMiddleware({ allowedOrigins }) {
  return cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  });
}

// Limita las peticiones por IP en una ventana de un minuto y responde 429 con { detail }.
export function createRateLimiter({ max }) {
  return rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    limit: max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new TooManyRequestsError()),
  });
}
