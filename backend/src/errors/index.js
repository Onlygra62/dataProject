// Errores de la aplicacion. Cada uno lleva el codigo HTTP con el que se responde,
// asi los servicios lanzan el error y no necesitan saber nada de HTTP.

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

// 400: la peticion es invalida (formato no soportado, archivo corrupto, dataset sin datos utiles)
export class BadRequestError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

// 400: el archivo subido no es CSV ni XLSX
export class FormatoInvalidoError extends BadRequestError {
  constructor(message = 'Formato no soportado. Sube un archivo .csv o .xlsx.') {
    super(message);
  }
}

// 413: el archivo subido supera el tamano maximo permitido
export class PayloadTooLargeError extends AppError {
  constructor(message = 'El archivo es demasiado grande.') {
    super(message, 413);
  }
}

// 404: el recurso pedido no existe (por ejemplo, un dataset que no esta en memoria)
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado.') {
    super(message, 404);
  }
}
