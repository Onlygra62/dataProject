/** Valores de configuracion compartidos. Cambiarlos aqui los cambia en toda la app. */

export const ACCEPTED_EXTENSIONS = ['.xlsx', '.csv']

// Debe coincidir con MAX_UPLOAD_MB del backend (backend/.env.example): si el front deja
// pasar archivos mas grandes, el servidor los rechaza con un 413.
export const MAX_FILE_SIZE_MB = 50
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

// Filas por pagina en la tabla de datos.
export const TABLE_PAGE_SIZE = 25

// Limites de las graficas de distribucion.
export const MAX_HISTOGRAM_BINS = 20
export const MAX_TOP_CATEGORIES = 12
export const MAX_TIMELINE_POINTS = 60
