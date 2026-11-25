import multer from 'multer';
import { BadRequestError, FormatoInvalidoError, PayloadTooLargeError } from '../errors/index.js';
import { isSupportedFile } from '../services/ingest.service.js';

export const UPLOAD_FIELD = 'file';
const BYTES_PER_MB = 1024 * 1024;

// Rechaza el archivo antes de leerlo entero si su extension no es .csv ni .xlsx.
// El contenido se valida despues, al parsearlo: el tipo MIME que declara el navegador
// no es confiable (cambia segun el sistema operativo), asi que no se usa.
function fileFilter(_req, file, callback) {
  callback(isSupportedFile(file.originalname) ? null : new FormatoInvalidoError(), true);
}

// Traduce los errores propios de multer al formato { detail } de la API.
function translateMulterError(error, maxUploadMb) {
  if (!(error instanceof multer.MulterError)) return error;

  if (error.code === 'LIMIT_FILE_SIZE') {
    return new PayloadTooLargeError(`El archivo supera el limite de ${maxUploadMb} MB.`);
  }
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new BadRequestError(`Envia un solo archivo en el campo "${UPLOAD_FIELD}".`);
  }
  return new BadRequestError(`No se pudo procesar la subida: ${error.message}`);
}

// Middleware que deja el archivo (en memoria) en req.file.
export function createUploadMiddleware({ maxUploadMb }) {
  const receiveFile = multer({
    storage: multer.memoryStorage(),
    // multer exige un entero de bytes, y MAX_UPLOAD_MB puede tener decimales (por ejemplo 0.5)
    limits: { fileSize: Math.floor(maxUploadMb * BYTES_PER_MB), files: 1 },
    fileFilter,
  }).single(UPLOAD_FIELD);

  return (req, res, next) => {
    receiveFile(req, res, (error) => next(error ? translateMulterError(error, maxUploadMb) : undefined));
  };
}
