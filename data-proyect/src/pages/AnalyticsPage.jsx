import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useDataset } from '../context/DatasetContext'
import { useDatasetData } from '../hooks/useDatasetData'
import { profileDataset } from '../lib/profile'
import { formatBytes, formatCount, formatPercent } from '../lib/format'
import StatTile from '../components/analytics/StatTile'
import ColumnsTable from '../components/analytics/ColumnsTable'
import DataTable from '../components/analytics/DataTable'
import DistributionChart from '../components/analytics/DistributionChart'
import { EmptyState, ErrorPanel, LoadingPanel } from '../components/analytics/StatePanels'
import Button from '../components/ui/Button'
import { buttonClass } from '../components/ui/buttonClass'
import {
  AlertTriangleIcon,
  ChartBarIcon,
  ColumnsIcon,
  CopyIcon,
  RefreshIcon,
  RowsIcon,
  TableIcon,
} from '../components/icons'

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

function DatasetAnalytics({ dataset, onClearDataset }) {
  const { rows, summary, error, reload } = useDatasetData(dataset.id)
  const [selectedColumn, setSelectedColumn] = useState(null)

  // Perfilar recorre todas las filas, asi que solo se recalcula al cambiar los datos.
  const profile = useMemo(
    () => (rows && summary ? profileDataset(rows, summary) : null),
    [rows, summary],
  )

  if (error) {
    return <ErrorPanel error={error} onRetry={reload} onUploadAnother={onClearDataset} />
  }

  if (!profile) return <LoadingPanel name={dataset.name} />

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
            <Button variant="secondary" onClick={reload}>
              <RefreshIcon className="h-4 w-4" />
              Recargar
            </Button>
            <Link to="/" className={buttonClass()}>
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
                      <option key={column.name} value={column.name} className="bg-surface-raised">
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
