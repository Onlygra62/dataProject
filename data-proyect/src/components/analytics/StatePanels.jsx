import { Link } from 'react-router'
import { AlertTriangleIcon, ChartBarIcon, RefreshIcon, SpinnerIcon } from '../icons'
import Button from '../ui/Button'
import { buttonClass } from '../ui/buttonClass'

// Paneles de la pantalla de analisis cuando todavia no hay nada que mostrar:
// sin dataset, cargando o con error. Comparten el mismo marco centrado.

function CenteredPanel({ children }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">{children}</div>
    </div>
  )
}

// Icono en un circulo, titulo y descripcion: la cabecera comun de EmptyState y ErrorPanel.
function PanelHeading({ icon: Icon, iconStyle, title, children }) {
  return (
    <>
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
        <Icon className="h-7 w-7 text-slate-300" style={iconStyle} />
      </div>
      <h2 className="mt-6 text-2xl font-bold text-slate-100">{title}</h2>
      <p className="mt-3 text-sm text-slate-400">{children}</p>
    </>
  )
}

export function EmptyState() {
  return (
    <CenteredPanel>
      <PanelHeading icon={ChartBarIcon} title="Todavía no hay datos">
        Sube un archivo .csv o .xlsx para ver aquí su perfil, sus columnas y sus filas.
      </PanelHeading>
      <Link to="/" className={buttonClass({ size: 'lg', className: 'mt-7' })}>
        Subir un archivo
      </Link>
    </CenteredPanel>
  )
}

export function LoadingPanel({ name }) {
  return (
    <CenteredPanel>
      <SpinnerIcon className="mx-auto h-8 w-8 animate-spin text-slate-400" />
      <p className="mt-4 text-sm text-slate-400">Cargando {name}…</p>
    </CenteredPanel>
  )
}

export function ErrorPanel({ error, onRetry, onUploadAnother }) {
  // El backend guarda los datasets en memoria: si se reinicia, el id ya no existe.
  const isExpired = error.status === 404

  return (
    <CenteredPanel>
      <PanelHeading
        icon={AlertTriangleIcon}
        iconStyle={{ color: 'var(--viz-critical)' }}
        title={isExpired ? 'El dataset ya no está disponible' : 'No se pudieron cargar los datos'}
      >
        {isExpired
          ? 'El servidor guarda los datasets en memoria, así que se pierden al reiniciarlo. Sube el archivo de nuevo.'
          : error.message}
      </PanelHeading>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        {!isExpired && (
          <Button variant="secondary" size="lg" onClick={onRetry}>
            <RefreshIcon className="h-4 w-4" />
            Reintentar
          </Button>
        )}
        <Link to="/" onClick={onUploadAnother} className={buttonClass({ size: 'lg' })}>
          Subir otro archivo
        </Link>
      </div>
    </CenteredPanel>
  )
}
