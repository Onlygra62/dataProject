const API_URL = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000').replace(/\/+$/, '')

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function readErrorMessage(response) {
  try {
    const body = await response.json()
    if (typeof body?.detail === 'string') return body.detail

    if (Array.isArray(body?.detail)) return body.detail.map((item) => item.msg).join(', ')
  } catch {
    // El cuerpo no era JSON eso lo muestra el mensaje estandar de js :) 
  }
  return `El servidor respondio ${response.status}.`
}

async function request(path, options) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, options)
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica que el backend este corriendo.',
      0,
    )
  }

  if (!response.ok) {
    throw new ApiError(await readErrorMessage(response), response.status)
  }
  return response.json()
}

export function uploadDataset(file, { signal } = {}) {
  const body = new FormData()
  body.append('file', file)
  return request('/datasets', { method: 'POST', body, signal })
}

export function getFullDataset(datasetId, { signal } = {}) {
  return request(`/datasets/${datasetId}/full`, { signal })
}

export function getPreview(datasetId, { signal } = {}) {
  return request(`/datasets/${datasetId}/preview`, { signal })
}
