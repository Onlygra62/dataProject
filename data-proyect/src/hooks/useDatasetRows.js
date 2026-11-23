import { useCallback, useEffect, useState } from 'react'
import { getFullDataset } from '../api/datasets'

/**
 * Carga las filas de un dataset desde el backend.
 * Devuelve { rows, error, reload }: rows es null mientras carga, y error es el ApiError
 * si la peticion falla. reload vuelve a pedir los datos.
 */
export function useDatasetRows(datasetId) {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  // Volver a "cargando" se hace aqui, en el manejador, para no tocar estado
  // sincronamente dentro del efecto.
  const reload = useCallback(() => {
    setRows(null)
    setError(null)
    setReloadToken((token) => token + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    getFullDataset(datasetId, { signal: controller.signal })
      .then(setRows)
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(requestError)
      })

    return () => controller.abort()
  }, [datasetId, reloadToken])

  return { rows, error, reload }
}
