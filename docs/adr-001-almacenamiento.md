# ADR-001: Diseño del almacenamiento del proyecto en Amazon S3

- Fecha: 2026-10-20
- Autor: Juan Gonzalez
- Estado: Aceptada

## Contexto

El proyecto es una aplicación "Drop & Analyze": el usuario sube un archivo CSV o XLSX, el backend (FastAPI) lo convierte en un DataFrame y el frontend (React + Vite) muestra tablas y gráficas de análisis.

Hasta ahora el backend guarda los datasets en un diccionario en memoria (`cache[dataset_id]`). Eso significa que al reiniciar el servidor se pierde todo, que no se puede escalar a más de una instancia y que los archivos originales nunca se conservan. Además, el bucket que teníamos solo contenía un archivo de prueba sin significado, y no había una regla clara de qué dato va en qué lugar.

El frontend compilado también necesita un lugar donde publicarse para que cualquier navegador pueda cargarlo, y los datos del proyecto (archivos subidos, datasets procesados, exportaciones y logs) necesitan un lugar donde vivir de forma persistente.

Por último, el equipo activó el versionado para poder recuperar archivos sobrescritos o borrados por error. Eso resolvió ese problema pero creó otro: el bucket guarda todas las versiones de todo, y cada versión cuesta, así que hace falta una regla que controle el costo.

## Decisión

Se adopta un único bucket de Amazon S3, con la siguiente configuración:

- Nombre y región: `cuc-bq-equipo76-sitio-2026`, en US East (N. Virginia), `us-east-1`.
- Acceso: las cuatro opciones de "Bloquear acceso público" están desactivadas y la política de bucket `LecturaPublicaSitio` permite `s3:GetObject` a cualquier persona (`Principal: *`) sobre todo el bucket (`arn:aws:s3:::cuc-bq-equipo76-sitio-2026/*`). Es decir, todos los objetos del bucket se pueden leer públicamente, sin autenticación.
- Prefijos y objetos en la raíz:
  - `index.html`, `favicon.svg`, `icons.svg`: archivos del sitio en la raíz.
  - `assets/`: JS y CSS generados por Vite.
  - `archivosOriginales/`: archivos CSV o XLSX subidos por los usuarios.
  - `datasetsProcesados/`: datasets ya procesados.
  - `Exportaciones/`: reportes descargables.
  - `logsIngestaYErrores/`: logs de ingesta y errores.
  - `Assets/`: carpeta duplicada con otra capitalización (S3 distingue mayúsculas); pendiente de eliminar.
- Versionado: habilitado en todo el bucket (MFA Delete deshabilitado).
- Cifrado: el predeterminado de S3 (SSE-S3), sin configuración adicional.
- Ciclo de vida: una regla llamada `retencion-sitio`, aplicada al bucket completo:
  - Versión actual: pasa a Standard-IA a los 30 días y a Glacier Flexible Retrieval a los 90 días.
  - Versiones no actuales: se eliminan permanentemente a los 180 días de dejar de ser la versión actual, sin conservar ninguna versión no actual más reciente.

Esta configuración corresponde a la etapa actual del proyecto, en la que el bucket se usa para publicar el sitio y para probar el versionado y el ciclo de vida con datos de prueba.

## Alternativas consideradas

1. Dos buckets, uno privado (datos de usuarios, exportaciones y logs, con Block Public Access activado y URLs prefirmadas) y uno público (solo el sitio y los datos de ejemplo). Se descartó por ahora porque el bucket se usa para probar el versionado y el ciclo de vida con datos ficticios, no con datos reales de usuarios, y mantener dos buckets duplica la configuración de permisos y de reglas. Es la opción que adoptaríamos antes de manejar datos reales.
2. Un solo bucket con política pública limitada a los archivos del sitio (`index.html`, `favicon.svg`, `icons.svg` y `assets/*`), dejando el resto privado. Se descartó por ahora porque el bucket no contiene datos reales y la política actual es más simple de mantener y de probar. Es la alternativa de menor esfuerzo para cerrar el riesgo si se decide seguir con un solo bucket.
3. Seguir con el diccionario en memoria o con el disco del servidor, sin S3. Se descartó porque se pierde todo al reiniciar, no se puede tener más de una instancia del backend y no hay respaldo ni historial de versiones.

## Consecuencias

### Positivas

- Todo el proyecto está en un solo lugar y con una sola configuración, lo que facilita probar el versionado y el ciclo de vida.
- El sitio se puede abrir desde cualquier navegador sin credenciales, porque la lectura pública cubre los archivos del frontend.
- Se puede recuperar cualquier archivo sobrescrito o borrado por error gracias al versionado.
- Los costos de almacenamiento bajan con el tiempo gracias a la regla `retencion-sitio`, y las versiones viejas no se acumulan sin límite.
- El backend deja de depender de la memoria del servidor, así que se puede reiniciar sin perder datos.

### Costos o desventajas que aceptamos

- Por la política `/*`, los prefijos `archivosOriginales/`, `datasetsProcesados/`, `Exportaciones/` y `logsIngestaYErrores/` también son legibles públicamente por cualquiera que conozca la URL. Lo aceptamos porque hoy solo contienen datos de prueba.
- La regla de ciclo de vida abarca el bucket completo, incluidos los archivos del sitio. Si `index.html`, `favicon.svg`, `icons.svg` o `assets/` llegan a 90 días sin volver a subirse, pasan a Glacier Flexible Retrieval y S3 deja de servirlos hasta que se restauren. Mientras el sitio se vuelva a desplegar con regularidad, cada subida crea una versión nueva y el plazo se reinicia.
- Recuperar un archivo de Glacier tarda desde minutos hasta horas, y Standard-IA y Glacier cobran un mínimo de días de almacenamiento y un costo por recuperación.
- Standard-IA cobra un mínimo de 128 KB por objeto, así que para archivos CSV o archivos del sitio pequeños el ahorro es casi nulo.
- El versionado guarda cada sobrescritura, así que durante 180 días pagamos por versiones que probablemente nunca se usen.
- Existen dos carpetas, `assets/` y `Assets/`, que pueden causar confusión sobre cuál usa el sitio.

### Qué habría que revisar más adelante

- Antes de guardar datos reales de usuarios: separar los datos en un bucket privado con Block Public Access activado y URLs prefirmadas (alternativa 1), o al menos restringir la política pública a los archivos del sitio (alternativa 2).
- Excluir los archivos del sitio de la regla de ciclo de vida (por ejemplo, con un filtro por prefijo) o confirmar que se despliegan con una frecuencia menor a 90 días.
- Si los plazos de 30, 90 y 180 días son los correctos, comparándolos con el uso real y la factura mensual de AWS.
- Eliminar la carpeta duplicada `Assets/` y dejar solo `assets/`.
- Si conviene agregar CloudFront delante del bucket cuando haya más tráfico o un dominio propio.
- Si hay que eliminar los datos de un usuario a petición suya (por ejemplo, por normas de protección de datos), ya que el versionado y Glacier complican el borrado definitivo.
