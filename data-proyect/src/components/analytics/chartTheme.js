/**
 * Tema compartido de Chart.js.
 *
 * La app es dark-only, asi que los valores estan fijados contra la superficie
 * #0a0e1a. Rejilla y ejes son recesivos: el dato es lo que debe destacar.
 */

export const SERIES_COLOR = '#3987e5'
export const GRID_COLOR = 'rgba(255, 255, 255, 0.06)'
export const TICK_COLOR = '#898781'

export const BAR_STYLE = {
  backgroundColor: SERIES_COLOR,
  hoverBackgroundColor: '#5598e7',
  borderRadius: 4,
  borderSkipped: false,
  // Deja ~2px de superficie entre barras contiguas.
  categoryPercentage: 0.86,
  barPercentage: 0.92,
}

const TOOLTIP = {
  backgroundColor: '#11162a',
  borderColor: 'rgba(255,255,255,0.12)',
  borderWidth: 1,
  titleColor: '#f1f5f9',
  bodyColor: '#cbd5e1',
  padding: 10,
  displayColors: false,
}

const BASE_TICKS = {
  color: TICK_COLOR,
  font: { size: 11 },
  padding: 8,
  autoSkipPadding: 12,
}

/** Eje de categorias: sin rejilla (seria ruido) y con etiquetas recortadas. */
const categoryAxis = {
  grid: { display: false },
  border: { display: false },
  ticks: {
    ...BASE_TICKS,
    maxRotation: 0,
    callback(value) {
      const label = this.getLabelForValue(value)
      if (typeof label !== 'string') return label
      return label.length > 22 ? `${label.slice(0, 21)}…` : label
    },
  },
}

/** Eje de magnitud: anclado en cero y con rejilla tenue. */
const valueAxis = {
  beginAtZero: true,
  grid: { display: true, color: GRID_COLOR, drawTicks: false },
  border: { display: false },
  ticks: BASE_TICKS,
}

/**
 * @param {'x'|'y'} indexAxis - 'y' produce barras horizontales.
 */
export function barOptions(indexAxis = 'x') {
  const isHorizontal = indexAxis === 'y'

  return {
    indexAxis,
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250 },
    // Una sola serie: la leyenda seria ruido, el titulo de la tarjeta ya la nombra.
    plugins: {
      legend: { display: false },
      tooltip: {
        ...TOOLTIP,
        callbacks: {
          label: (context) => {
            const count = context.parsed[isHorizontal ? 'x' : 'y']
            return ` ${count} ${count === 1 ? 'fila' : 'filas'}`
          },
        },
      },
    },
    scales: isHorizontal
      ? { x: valueAxis, y: categoryAxis }
      : { x: categoryAxis, y: valueAxis },
  }
}
