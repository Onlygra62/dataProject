import { formatCount, formatNumber, formatPercent } from '../../lib/format'

const KIND_LABELS = {
  numeric: 'Numérica',
  categorical: 'Categórica',
  datetime: 'Fecha',
  boolean: 'Booleana',
  empty: 'Vacía',
}

const KIND_COLORS = {
  numeric: 'var(--viz-numeric)',
  categorical: 'var(--viz-categorical)',
  datetime: 'var(--viz-datetime)',
  boolean: 'var(--viz-boolean)',
  empty: 'var(--viz-empty)',
}

/** El tipo va con color y etiqueta: nunca depende del color solo. */
function KindBadge({ kind }) {
  const color = KIND_COLORS[kind] ?? KIND_COLORS.empty
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap">
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <span style={{ color }}>{KIND_LABELS[kind] ?? kind}</span>
    </span>
  )
}

/** Medidor de magnitud de un solo tono; el porcentaje siempre visible al lado. */
function NullMeter({ nulls, nullPct }) {
  if (nulls === 0) {
    return <span className="text-xs text-slate-500">Sin vacíos</span>
  }

  const isFullyEmpty = nullPct >= 100
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.max(nullPct, 2)}%`,
            backgroundColor: isFullyEmpty ? 'var(--viz-critical)' : 'var(--viz-numeric)',
          }}
        />
      </div>
      <span className="text-xs whitespace-nowrap tabular-nums text-slate-300">
        {formatCount(nulls)} · {formatPercent(nullPct)}
      </span>
    </div>
  )
}

export default function ColumnsTable({ columnProfiles }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/3">
      <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs tracking-wide text-slate-400 uppercase">
            <th scope="col" className="px-4 py-3 font-semibold">Columna</th>
            <th scope="col" className="px-4 py-3 font-semibold">Tipo</th>
            <th scope="col" className="px-4 py-3 font-semibold">Vacíos</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Únicos</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Mín</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Máx</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Media</th>
            <th scope="col" className="px-4 py-3 font-semibold">Más frecuente</th>
          </tr>
        </thead>
        <tbody>
          {columnProfiles.map((column) => (
            <tr key={column.name} className="border-b border-white/5 last:border-b-0">
              <th
                scope="row"
                className="max-w-56 truncate px-4 py-3 text-left font-medium text-slate-100"
                title={column.name}
              >
                {column.name}
              </th>
              <td className="px-4 py-3"><KindBadge kind={column.kind} /></td>
              <td className="px-4 py-3">
                <NullMeter nulls={column.nulls} nullPct={column.nullPct} />
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-300">
                {formatCount(column.unique)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-300">
                {formatNumber(column.min)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-300">
                {formatNumber(column.max)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-300">
                {formatNumber(column.mean)}
              </td>
              <td className="max-w-48 truncate px-4 py-3 text-slate-300" title={column.top ?? ''}>
                {column.top ?? '—'}
                {column.topCount ? (
                  <span className="ml-1 text-xs text-slate-500">({formatCount(column.topCount)})</span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
