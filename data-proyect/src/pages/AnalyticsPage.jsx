import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { getFullDataset } from '../api/datasets'
import { useDataset } from '../context/DatasetContext'
import { profileDataset } from '../lib/profile'
import { formatBytes, formatCount, formatPercent } from '../lib/format'
import StatTile from '../components/analytics/StatTile'
import ColumnsTable from '../components/analytics/ColumnsTable'
import DataTable from '../components/analytics/DataTable'
import DistributionChart from '../components/analytics/DistributionChart'
import {
  AlertTriangleIcon,
  ChartBarIcon,
  ColumnsIcon,
  CopyIcon,
  RefreshIcon,
  RowsIcon,
  SpinnerIcon,
  TableIcon,
} from '../components/icons'

function CenteredPanel({ children }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">{children}</div>
    </div>
  )
}

function SectionTitle({ icon: Icon, children, aside }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-300 uppercase">
        <Icon className="h-4 w-4" />
        {children}
      </h2>
      {aside}
    </div>
  )
}

function EmptyState() {
  return (
    <CenteredPanel>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
        <ChartBarIcon className="h-7 w-7 text-slate-300" />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-slate-100">Todavía no hay datos</h2>
      <p className="mt-3 text-sm text-slate-400">
        Sube un archivo .csv o .xlsx para ver aquí su perfil, sus columnas y sus filas.
      </p>
      <Link
        to="/"
        className="mt-7 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-blue-500"
      >
        Subir un archivo
      </Link>
    </CenteredPanel>
  )
}

function DatasetAnalytics({ dataset, onClearDataset }) {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [selectedColumn, setSelectedColumn] = useState(null)

  // Volver a "cargando" se hace aqui, en el manejador, para no tocar estado
  // sincronamente dentro del efecto.
  const reload = useCallback(() => {
    setRows(null)
    setError(null)
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    getFullDataset(dataset.id, { signal: controller.signal })
      .then(setRows)
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError)
      })

    return () => controller.abort()
  }, [dataset.id, reloadToken])

  // Perfilar recorre todas las filas, asi que solo se recalcula al cambiar los datos.
  const profile = useMemo(() => (rows ? profileDataset(rows) : null), [rows])

  if (error) {
    // El backend guarda los datasets en memoria: si se reinicia, el id ya no existe.
    const isExpired = error.status === 404
    return (
      <CenteredPanel>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
          <AlertTriangleIcon className="h-7 w-7" style={{ color: 'var(--viz-critical)' }} />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-slate-100">
          {isExpired ? 'El dataset ya no está disponible' : 'No se pudieron cargar los datos'}
        </h2>
        <p className="mt-3 text-sm text-slate-400">
          {isExpired
            ? 'El servidor guarda los datasets en memoria, así que se pierden al reiniciarlo. Sube el archivo de nuevo.'
            : error.message}
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {!isExpired && (
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/5"
            >
              <RefreshIcon className="h-4 w-4" />
              Reintentar
            </button>
          )}
          <Link
            to="/"
            onClick={onClearDataset}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-blue-500"
          >
            Subir otro archivo
          </Link>
        </div>
      </CenteredPanel>
    )
  }

  if (!profile) {
    return (
      <CenteredPanel>
        <SpinnerIcon className="mx-auto h-8 w-8 animate-spin text-slate-400" />
        <p className="mt-4 text-sm text-slate-400">Cargando {dataset.name}…</p>
      </CenteredPanel>
    )
  }

  const emptyCellPct = profile.totalCells
    ? (profile.totalNulls / profile.totalCells) * 100
    : 0

  // Sin eleccion explicita, arrancamos en la primera columna numerica.
  const activeColumn =
    profile.columnProfiles.find((column) => column.name === selectedColumn) ??
    profile.columnProfiles.find((column) => column.kind === 'numeric') ??
    profile.columnProfiles[0] ??
    null

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-100">
              {dataset.name}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              {formatCount(profile.rowCount)} filas · {formatCount(profile.columnCount)} columnas
              {dataset.size ? ` · ${formatBytes(dataset.size)}` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/5"
            >
              <RefreshIcon className="h-4 w-4" />
              Recargar
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Nuevo archivo
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatTile icon={RowsIcon} label="Filas" value={formatCount(profile.rowCount)} />
          <StatTile icon={ColumnsIcon} label="Columnas" value={formatCount(profile.columnCount)} />
          <StatTile
            icon={AlertTriangleIcon}
            label="Celdas vacías"
            value={formatCount(profile.totalNulls)}
            hint={`${formatPercent(emptyCellPct)} del total`}
          />
          <StatTile
            icon={CopyIcon}
            label="Filas duplicadas"
            value={formatCount(profile.duplicateRows)}
            hint={profile.duplicateRows === 0 ? 'Ninguna repetida' : 'Repetidas por completo'}
          />
        </div>

        {activeColumn && (
          <section className="mt-10">
            <SectionTitle
              icon={ChartBarIcon}
              aside={
                <label className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="tracking-wide uppercase">Columna</span>
                  <select
                    value={activeColumn.name}
                    onChange={(changeEvent) => setSelectedColumn(changeEvent.target.value)}
                    className="max-w-56 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                  >
                    {profile.columnProfiles.map((column) => (
                      <option key={column.name} value={column.name} className="bg-[#0a0e1a]">
                        {column.name}
                      </option>
                    ))}
                  </select>
                </label>
              }
            >
              Distribución
            </SectionTitle>
            <div className="mt-4">
              <DistributionChart columnProfile={activeColumn} rows={rows} />
            </div>
          </section>
        )}

        <section className="mt-10">
          <SectionTitle icon={TableIcon}>Perfil por columna</SectionTitle>
          <div className="mt-4">
            <ColumnsTable columnProfiles={profile.columnProfiles} />
          </div>
        </section>

        <section className="mt-10 pb-4">
          <SectionTitle icon={RowsIcon}>Datos</SectionTitle>
          <div className="mt-4">
            <DataTable columns={profile.columns} rows={rows} />
          </div>
        </section>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const { dataset, clearDataset } = useDataset()

  if (!dataset) return <EmptyState />

  // La key remonta al cambiar de dataset, asi el estado arranca limpio solo.
  return (
    <DatasetAnalytics key={dataset.id} dataset={dataset} onClearDataset={clearDataset} />
  )
}
