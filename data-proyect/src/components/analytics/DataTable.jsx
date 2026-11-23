import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '../icons'
import { formatCell, formatCount } from '../../lib/format'
import Card from '../ui/Card'

const PAGE_SIZE = 25

function PageButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:text-slate-600 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}

export default function DataTable({ columns, rows }) {
  const [page, setPage] = useState(0)

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  // Si el dataset cambia y la pagina actual queda fuera de rango, la acotamos.
  const safePage = Math.min(page, pageCount - 1)

  const visibleRows = rows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  const firstRowNumber = safePage * PAGE_SIZE + 1
  const lastRowNumber = Math.min(firstRowNumber + PAGE_SIZE - 1, rows.length)

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs tracking-wide text-slate-400 uppercase">
              <th scope="col" className="px-4 py-3 font-semibold">#</th>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-4 py-3 font-semibold whitespace-nowrap"
                  title={column}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, rowIndex) => (
              <tr
                key={safePage * PAGE_SIZE + rowIndex}
                className="border-b border-white/5 last:border-b-0"
              >
                <td className="px-4 py-2.5 tabular-nums text-slate-500">
                  {firstRowNumber + rowIndex}
                </td>
                {columns.map((column) => {
                  const cell = formatCell(row[column])
                  return (
                    <td
                      key={column}
                      className="max-w-64 truncate px-4 py-2.5 whitespace-nowrap text-slate-200"
                      title={cell ?? ''}
                    >
                      {cell ?? <span className="text-slate-600 italic">vacío</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-3">
        <p className="text-xs text-slate-400 tabular-nums">
          {rows.length === 0
            ? 'Sin filas'
            : `${formatCount(firstRowNumber)}–${formatCount(lastRowNumber)} de ${formatCount(rows.length)}`}
        </p>

        <div className="flex items-center gap-1">
          <PageButton
            label="Página anterior"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </PageButton>
          <span className="px-2 text-xs text-slate-400 tabular-nums">
            {safePage + 1} / {pageCount}
          </span>
          <PageButton
            label="Página siguiente"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage(safePage + 1)}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </PageButton>
        </div>
      </div>
    </Card>
  )
}
