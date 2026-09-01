import { useCallback, useState } from 'react'
import { DatasetContext, STORAGE_KEY } from './DatasetContext'

/** Lee el dataset activo persistido, para sobrevivir a un refresh de la pagina. */
function readStoredDataset() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function DatasetProvider({ children }) {
  const [dataset, setDatasetState] = useState(readStoredDataset)

  const setDataset = useCallback((next) => {
    setDatasetState(next)
    try {
      if (next) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      else sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // En modo privado sessionStorage puede fallar: seguimos solo en memoria.
    }
  }, [])

  const clearDataset = useCallback(() => setDataset(null), [setDataset])

  // Sin memo: los consumidores cuelgan de App, asi que ya se re-renderizan
  // cuando este provider lo hace. Los setters si van con useCallback, porque
  // ahi la identidad estable es correccion (deps de efectos), no rendimiento.
  return (
    <DatasetContext.Provider value={{ dataset, setDataset, clearDataset }}>
      {children}
    </DatasetContext.Provider>
  )
}
