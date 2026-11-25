/**
 * Tema compartido de Chart.js.
 *
 * La app es dark-only. Rejilla y ejes son recesivos: el dato es lo que debe destacar.
 * Los colores de la serie y de los ejes salen de los tokens --viz-* de index.css, para
 * que el grafico y el resto de la interfaz usen siempre el mismo valor.
 */

const AXIS_LABEL_MAX_CHARS = 22

/**
 * Chart.js pinta en un canvas, que no entiende var(--token). Por eso se lee el valor
 * del token en el momento de dibujar (y no al importar el modulo, cuando el CSS aun
 * podria no estar cargado).
 */
function token(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const GRID_COLOR = 'rgba(255, 255, 255, 0.06)'

export function barStyle() {
  return {
    backgroundColor: token('--viz-numeric'),
    hoverBackgroundColor: '#5598e7',
    borderRadius: 4,
    borderSkipped: false,
    // Deja ~2px de superficie entre barras contiguas.
    categoryPercentage: 0.86,
    barPercentage: 0.92,
  }
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

function baseTicks() {
  return {
    color: token('--viz-empty'),
    font: { size: 11 },
    padding: 8,
    autoSkipPadding: 12,
  }
}

/** Eje de categorias: sin rejilla (seria ruido) y con etiquetas recortadas. */
function categoryAxis() {
  return {
    grid: { display: false },
    border: { display: false },
    ticks: {
      ...baseTicks(),
      maxRotation: 0,
      callback(value) {
        const label = this.getLabelForValue(value)
        if (typeof label !== 'string') return label
        return label.length > AXIS_LABEL_MAX_CHARS
          ? `${label.slice(0, AXIS_LABEL_MAX_CHARS - 1)}…`
          : label
      },
    },
  }
}

/** Eje de magnitud: anclado en cero y con rejilla tenue. */
function valueAxis() {
  return {
    beginAtZero: true,
    grid: { display: true, color: GRID_COLOR, drawTicks: false },
    border: { display: false },
    ticks: baseTicks(),
  }
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
      ? { x: valueAxis(), y: categoryAxis() }
      : { x: categoryAxis(), y: valueAxis() },
  }
}
