# dataProject

Proyecto de Buenas Prácticas del Desarrollo de Software.

## Descripción

Aplicación de análisis de datos con backend en **FastAPI** y frontend en **React (Vite)**.
Permite subir un dataset (`.csv` o `.xlsx`), guardarlo en memoria y consultar estadísticas
sobre él a través de una API, con una interfaz web para cargar archivos y visualizar los
resultados (tablas, gráficas de distribución, resumen por columna).

El proyecto se desarrolla por fases:

- **Fase 1 — Ingesta**: subida de archivos, conversión a `DataFrame`, endpoints de
  carga y consulta (`POST /datasets`, `GET /datasets/{id}/preview`, `GET /datasets/{id}/full`).
- **Fase 2 — Descriptiva**: estadísticas descriptivas por columna numérica (media,
  mediana, moda, varianza, desviación estándar, mínimo/máximo, cuartiles, IQR y
  coeficiente de variación) vía `GET /datasets/{id}/summary`.

## Integrantes

- Daniel Maldonado
- Juan Turizo
- Juan Gonzalez

## Estructura del proyecto

```
dataProject/
├── backend/          # API en FastAPI (Python)
│   └── src/
│       ├── api/routes/     # Endpoints
│       ├── schemas/        # Modelos Pydantic
│       ├── services/       # Lógica de negocio
│       ├── core/           # Cache y utilidades compartidas
│       └── tests/          # Tests
└── data-proyect/     # Frontend en React + Vite
```

## Instrucciones de instalación y uso

### Backend

Requiere **Python 3.13+** y **[uv](https://docs.astral.sh/uv/getting-started/installation/)**.

```bash
cd backend
uv sync
uv run fastapi dev
```

El backend queda disponible en `http://127.0.0.1:8000`.

> Alternativa sin `uv`, usando pip directamente:
> ```bash
> cd backend
> pip install "fastapi[standard]" "pandas[excel]"
> fastapi dev src/main.py
> ```

Para probar la subida de un archivo desde consola (Git Bash):

```bash
curl -X POST "http://127.0.0.1:8000/datasets" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@data.csv"
```

También podés usar el script ya incluido en `backend/src/tests/ingest.sh` (colócate en esa
carpeta y ejecutalo con Git Bash).

Endpoints principales:

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/datasets` | Sube un `.csv` o `.xlsx` y devuelve el `dataset_id` |
| `GET` | `/datasets/{id}/preview` | Muestra una vista parcial del dataset |
| `GET` | `/datasets/{id}/full` | Muestra el dataset completo |
| `GET` | `/datasets/{id}/summary` | Estadísticas descriptivas por columna numérica |

### Frontend

Requiere **Node.js**.

```bash
cd data-proyect
npm install
npm run dev
```

La app queda disponible en la URL que indique Vite (por defecto `http://localhost:5173`),
y se conecta al backend en `http://127.0.0.1:8000`, así que este debe estar corriendo primero.

### Tests

```bash
cd backend
python -m unittest discover src/tests
```

## Flujo de trabajo (Git)

- `main`: rama estable/default.
- `dev`: rama de integración; las features se mergean primero aquí.
- `feature/<nombre>`: una rama por persona/tarea, creada desde `dev`. Al terminar,
  se abre un Pull Request de `feature/<nombre>` hacia `dev` (no hacia `main`).
