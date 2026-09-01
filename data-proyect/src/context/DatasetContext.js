import { createContext, useContext } from 'react'

export const STORAGE_KEY = 'dataproyect.activeDataset'

export const DatasetContext = createContext(null)

export function useDataset() {
  const context = useContext(DatasetContext)
  if (!context) {
    throw new Error('useDataset debe usarse dentro de <DatasetProvider>')
  }
  return context
}
