# dataProject

Aplicación web para analizar datasets: el usuario sube un archivo `.csv` o `.xlsx` y la app le muestra su perfil (tipos de columna, valores vacíos, duplicados), estadísticas descriptivas, gráficas de distribución y los datos en una tabla paginada. Está pensada para estudiantes y analistas que quieren explorar un archivo rápido, sin instalar herramientas de análisis.

## Integrantes

| Integrante | A qué se dedicó |
|---|---|
| Daniel Maldonado | 
| Juan Turizo 
| Juan Gonzalez 

### Flujo de trabajo del equipo (Git)

- `main`: rama estable/default.
- `dev`: rama de integración; las features se mergean primero aquí.
- `feature/<nombre>` o `refactor/<tema>`: una rama por persona o tarea, creada desde `dev`. Al terminar se abre un Pull Request hacia `dev` (no hacia `main`) y otro integrante lo revisa antes del merge.
- Mensajes de commit con [Conventional Commits](https://www.conventionalcommits.org/es/): `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.

## Tecnologias

- **React 19** con **Vite**: interfaz web (componentes, contexto para el estado, rutas con React Router).
- **Tailwind CSS** y **Chart.js**: estilos y gráficas.
- **Node.js** con **Express 5**: API REST en capas. Librerías principales: `multer` (subida de archivos), `csv-parse` y `read-excel-file` (lectura de CSV y XLSX), `helmet`, `cors` y `express-rate-limit` (seguridad).
- **Vitest**: pruebas automáticas.
- **AWS S3 y EC2**: despliegue (S3 para el front compilado, EC2 para la API).

### Estructura del proyecto

```
dataProject/
├── backend/              # API Node + Express, en capas
│   ├── src/
│   │   ├── routes/         # Declara las rutas y qué controller responde cada una
│   │   ├── controllers/    # Capa HTTP: lee la petición y arma la respuesta
│   │   ├── services/       # Lógica: lectura de archivos, estadísticas, casos de uso
│   │   ├── repositories/   # Dónde se guardan los datasets (hoy, en memoria)
│   │   ├── middleware/     # Errores, subida de archivos, CORS y límite de peticiones
│   │   ├── errors/         # Errores tipados con su código HTTP
│   │   ├── config/         # Lectura y validación de variables de entorno
│   │   ├── app.js          # Arma la app de Express (no abre puerto)
│   │   └── server.js       # Arranca el servidor
│   └── tests/fixtures/     # Archivos de ejemplo para las pruebas (data.csv)
└── data-proyect/         # Frontend React + Vite
    └── src/
        ├── api/            # Llamadas al backend
        ├── components/     # Componentes (ui/ = Card y Button reutilizables)
        ├── context/        # Estado compartido: el dataset activo
        ├── hooks/          # Hooks, p. ej. la carga de datos del dataset
        ├── lib/            # Formato, perfilado y constantes compartidas
        └── pages/          # Pantallas: subida y análisis
```

Cada petición recorre las capas en un solo sentido: `routes → controllers → services → repositories`. Los servicios no saben nada de HTTP y el repositorio es el único que conoce dónde viven los datos, por lo que cambiar la memoria por S3 solo toca esa capa.

## Como levantarlo en local

Requiere **Node.js 20 o superior** y **git**.

```bash
git clone https://github.com/Onlygra62/dataProject
cd dataProject
```

**1. API** (puerto 8000):

```bash
cd backend
npm install
cp .env.example .env     # en PowerShell: Copy-Item .env.example .env
npm run dev
```

Comprueba que responde: abre `http://127.0.0.1:8000/salud` (debe mostrar `{"estado":"ok"}`).

**2. Frontend** (en otra terminal, desde la raíz del repo):

```bash
cd data-proyect
npm install
cp .env.example .env     # en PowerShell: Copy-Item .env.example .env
npm run dev
```

Abre la URL que muestra Vite (por defecto `http://localhost:5173`) y sube `backend/tests/fixtures/data.csv` para probar. La API debe estar corriendo primero.

### Variables de entorno

Ambos proyectos traen un `.env.example` con los valores de desarrollo; el `.env` real no se versiona. Si no creas el `.env`, se usan los valores por defecto de la columna "Por defecto".

| Proyecto | Variable | Para qué sirve | Por defecto |
|---|---|---|---|
| `backend` | `PORT` | Puerto donde escucha la API | `8000` |
| `backend` | `MAX_UPLOAD_MB` | Tamaño máximo de un archivo subido, en MB | `50` |
| `backend` | `CORS_ORIGIN` | Orígenes del front que pueden llamar a la API, separados por comas | `http://localhost:5173,http://127.0.0.1:5173` |
| `backend` | `RATE_LIMIT_MAX` | Peticiones máximas por minuto desde una misma IP | `100` |
| `data-proyect` | `VITE_API_URL` | URL de la API a la que se conecta el front | `http://127.0.0.1:8000` |

Notas:
- `VITE_API_URL` se fija **al compilar** (`npm run build`): para apuntar a otra API hay que volver a compilar.
- El límite de subida del front (`MAX_FILE_SIZE_MB` en `data-proyect/src/lib/constants.js`) debe coincidir con `MAX_UPLOAD_MB` del backend.
- Los datasets se guardan **en memoria**: al reiniciar la API se pierden y hay que volver a subir el archivo.

### Seguridad

La API aplica estas medidas:

1. **CORS restringido**: solo los orígenes de `CORS_ORIGIN` pueden leer las respuestas desde un navegador.
2. **Cabeceras HTTP seguras** con `helmet`.
3. **Validación de la subida**: solo `.csv` y `.xlsx` (sin distinguir mayúsculas), tamaño máximo `MAX_UPLOAD_MB`, y el contenido se valida al leerlo (un archivo corrupto responde 400).
4. **Límite de peticiones** por IP (`RATE_LIMIT_MAX` por minuto); al excederlo responde 429.
5. **Configuración por variables de entorno**: no hay secretos ni URLs fijas en el código y el `.env` está en el `.gitignore`.

Además, los errores nunca exponen detalles internos (un fallo inesperado responde un mensaje genérico) y los identificadores de dataset se validan como UUID.

### Revisión de dependencias

Las dependencias se revisan con `npm audit` en cada proyecto:

```bash
cd backend && npm audit
cd ../data-proyect && npm audit
```

Última revisión (2026-11-22):

| Proyecto | Resultado | Qué se hizo |
|---|---|---|
| `backend` | 0 vulnerabilidades | Al elegir la librería para leer `.xlsx` se descartó `exceljs` porque arrastraba una dependencia vulnerable (`uuid`), y se usó `read-excel-file`, que sale limpia. |
| `data-proyect` | 7 vulnerabilidades (4 altas, 3 moderadas) antes; 0 después | Eran dependencias indirectas (`vite`, `source-map-js`, `brace-expansion`, `minimatch`, `zod`). Se corrigieron con `npm audit fix` (sin `--force`, sin cambios incompatibles); solo cambió `package-lock.json`. Se comprobó que `npm run lint` y `npm run build` siguen pasando. |

Cada vez que se agregue o actualice una dependencia hay que volver a correr `npm audit` y no integrar cambios con vulnerabilidades altas o críticas.

## Endpoints de la API

URL base en local: `http://127.0.0.1:8000`.

| Método | Ruta | Qué hace | Respuesta |
|---|---|---|---|
| GET | `/salud` | Comprueba que la API está viva | 200 objeto `{ "estado": "ok" }` |
| POST | `/datasets` | Sube un `.csv` o `.xlsx` (campo `file`, multipart) | 201 objeto `{ "dataset_id": "..." }`; 400 archivo inválido o corrupto; 413 archivo demasiado grande |
| GET | `/datasets/:id/preview` | Primeras 5 filas del dataset | 200 arreglo de filas; 404 dataset no existe |
| GET | `/datasets/:id/full` | Todas las filas del dataset | 200 arreglo de filas; 404 dataset no existe |
| GET | `/datasets/:id/summary` | Estadísticas descriptivas de cada columna numérica (media, mediana, moda, varianza, desviación estándar, mínimo, máximo, cuartiles, IQR, coeficiente de variación) | 200 objeto `{ dataset_id, columnas }`; 400 sin columnas numéricas; 404 dataset no existe |

Todos los errores tienen el mismo formato: `{ "detail": "mensaje" }`. Además, cualquier ruta puede responder 429 (demasiadas peticiones).

Ejemplo, subir un archivo desde la consola:

```bash
curl -X POST http://127.0.0.1:8000/datasets -F "file=@backend/tests/fixtures/data.csv"
# {"dataset_id":"3f2b8c1e-..."}

curl http://127.0.0.1:8000/datasets/3f2b8c1e-.../summary
```

## Como correr las pruebas

```bash
cd backend
npm test
```

> **Pendiente:** las pruebas automáticas con Vitest las agrega el resto del equipo; hasta entonces `npm test` no existe. Los archivos de ejemplo ya están en `backend/tests/fixtures/`. Al agregarlas, actualizar esta sección con los comandos reales y los resultados.

## Despliegue

> **Pendiente:** el despliegue en AWS (front en S3 y API en EC2) lo completa el resto del equipo. Al terminarlo, documentar aquí dónde está publicado (URLs) y los pasos exactos para volver a desplegarlo.

Para quien despliegue, lo que hay que tener en cuenta del código:

- **API (EC2)**: definir `CORS_ORIGIN` con la URL donde se publica el front y `PORT`; arrancar con `npm start`. Abrir en el Security Group solo el puerto de la API.
- **Front (S3)**: compilar con `VITE_API_URL` apuntando a la API publicada (`npm run build` genera la carpeta `dist/`) y subir su contenido al bucket. El front usa rutas de React Router, así que el hosting debe devolver `index.html` cuando una ruta como `/analytics` no exista como archivo.
- **Almacenamiento**: la API guarda los datasets en memoria; la decisión de pasar a S3 está en [docs/adr-001-almacenamiento.md](docs/adr-001-almacenamiento.md).
