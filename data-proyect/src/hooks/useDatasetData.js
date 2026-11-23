import { useCallback, useEffect, useState } from 'react'
import { getFullDataset, getSummary } from '../api/datasets'

/**
 * Carga del backend las filas de un dataset y las estadisticas de sus columnas numericas.
 * Devuelve { rows, summary, error, reload }: rows y summary son null mientras carga, y
 * error es el ApiError si alguna peticion falla. reload vuelve a pedir los datos.
 */
export function useDatasetData(datasetId) {
  const [data, setData] = useState({ rows: null, summary: null })
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  // Volver a "cargando" se hace aqui, en el manejador, para no tocar estado
  // sincronamente dentro del efecto.
  const reload = useCallback(() => {
    setData({ rows: null, summary: null })
    setError(null)
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const options = { signal: controller.signal }

    Promise.all([getFullDataset(datasetId, options), getSummary(datasetId, options)])
      .then(([rows, summary]) => setData({ rows, summary: summary.columnas }))
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError)
      })

    return () => controller.abort()
  }, [datasetId, reloadToken])

  return { rows: data.rows, summary: data.summary, error, reload }
}
