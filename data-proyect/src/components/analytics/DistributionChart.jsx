import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { buildDistribution } from '../../lib/bins'
import { isBlank } from '../../lib/profile'
import { MAX_TOP_CATEGORIES } from '../../lib/constants'
import { formatCount } from '../../lib/format'
import Card from '../ui/Card'
import { barOptions, barStyle } from './chartTheme'

// Chart.js v4 no registra nada por defecto: solo lo que usamos.
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

// Alturas del grafico en pixeles: las barras horizontales crecen con el numero de categorias.
const VERTICAL_HEIGHT = 300
const MIN_HORIZONTAL_HEIGHT = 260
const HORIZONTAL_ROW_HEIGHT = 30

const TITLES = {
  histogram: (name) => `Distribución de ${name}`,
  categories: (name) => `Valores más frecuentes en ${name}`,
  timeline: (name) => `Registros por fecha en ${name}`,
  empty: (name) => `${name} no tiene valores`,
}

const CAPTIONS = {
  histogram: 'Cada barra agrupa un rango de valores; la altura es cuántas filas caen ahí.',
  categories: `Las ${MAX_TOP_CATEGORIES} categorías más frecuentes. El resto se agrupa en “Otros”.`,
  timeline: 'Filas por fecha, agrupadas por mes cuando el rango es amplio.',
  empty: '',
}

export default function DistributionChart({ columnProfile, rows }) {
  const values = useMemo(
    () => rows.map((row) => row[columnProfile.name]).filter((value) => !isBlank(value)),
    [rows, columnProfile.name],
  )

  const distribution = useMemo(
    () => buildDistribution(columnProfile.kind, values),
    [columnProfile.kind, values],
  )

  const title = TITLES[distribution.type](columnProfile.name)

  if (distribution.type === 'empty') {
    return (
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <p className="mt-8 mb-8 text-center text-sm text-slate-500">
          Todas las filas están vacías en esta columna.
        </p>
      </Card>
    )
  }

  // Las categorias van en horizontal: sus etiquetas son texto y se leen mejor asi.
  const isHorizontal = distribution.type === 'categories'

  const chartData = {
    labels: distribution.points.map((point) => point.label),
    datasets: [{ ...barStyle(), data: distribution.points.map((point) => point.count) }],
  }

  const options = barOptions(isHorizontal ? 'y' : 'x')

  const height = isHorizontal
    ? Math.max(MIN_HORIZONTAL_HEIGHT, distribution.points.length * HORIZONTAL_ROW_HEIGHT)
    : VERTICAL_HEIGHT

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <p className="text-xs text-slate-500 tabular-nums">
          {formatCount(values.length)} valores · {formatCount(columnProfile.unique)} únicos
        </p>
      </div>

      <div className="mt-5" style={{ height }}>
        <Bar data={chartData} options={options} />
      </div>

      <p className="mt-4 text-xs text-slate-500">{CAPTIONS[distribution.type]}</p>
    </Card>
  )
}
