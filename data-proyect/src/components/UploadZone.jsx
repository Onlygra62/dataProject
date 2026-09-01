import { useRef, useState } from 'react'
import { FileUploadIcon, PlusIcon, SpinnerIcon, XIcon } from './icons'

const ACCEPTED_EXTENSIONS = ['.xlsx', '.csv']
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exponent
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

function getExtension(filename) {
  const dotIndex = filename.lastIndexOf('.')
  return dotIndex === -1 ? '' : filename.slice(dotIndex).toLowerCase()
}

function validateFile(file) {
  if (!ACCEPTED_EXTENSIONS.includes(getExtension(file.name))) {
    return 'Formato no compatible. Sube un archivo .xlsx o .csv.'
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'El archivo supera el límite de 500MB.'
  }
  return null
}

export default function UploadZone({ onFileAccepted, isUploading = false, uploadError = '' }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  const shownError = uploadError || error

  const acceptFile = (candidate) => {
    if (!candidate) return
    const validationError = validateFile(candidate)
    if (validationError) {
      setError(validationError)
      setFile(null)
      return
    }
    setError('')
    setFile(candidate)
    onFileAccepted?.(candidate)
  }

  const handleDrop = (dropEvent) => {
    dropEvent.preventDefault()
    setIsDragging(false)
    if (isUploading) return
    acceptFile(dropEvent.dataTransfer.files?.[0])
  }

  const handleDragOver = (dragOverEvent) => {
    dragOverEvent.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (dragLeaveEvent) => {
    dragLeaveEvent.preventDefault()
    setIsDragging(false)
  }

  const handleBrowseClick = () => {
    if (isUploading) return
    inputRef.current?.click()
  }

  const handleFileInputChange = (changeEvent) => {
    acceptFile(changeEvent.target.files?.[0])
    changeEvent.target.value = ''
  }

  const handleRemoveFileClick = (removeFileClickEvent) => {
    removeFileClickEvent.stopPropagation()
    setFile(null)
    setError('')
  }

  return (
    <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/3 p-10 sm:p-14">
      <div
        role="button"
        tabIndex={0}
        onClick={handleBrowseClick}
        onKeyDown={(keyboardEvent) => {
          if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') handleBrowseClick()
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        aria-busy={isUploading}
        className={`flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
          isUploading ? 'cursor-wait opacity-70' : 'cursor-pointer'
        } ${
          isDragging
            ? 'border-blue-500 bg-blue-500/5'
            : 'border-transparent hover:border-white/10'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          disabled={isUploading}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 shadow-[0_0_50px_-10px_rgba(37,99,235,0.5)] ring-1 ring-white/10">
          <FileUploadIcon className="h-9 w-9 text-slate-200" />
        </div>

        <h2 className="mt-6 text-xl font-bold text-slate-100 sm:text-2xl">
          Sube tu archivo Excel para comenzar el análisis
        </h2>
        <p className="mt-3 max-w-md text-sm text-slate-400">
          Drag and drop your .xlsx or .csv files here, or click to browse your local machine.
          Maximum file size: 500MB.
        </p>

        <button
          type="button"
          onClick={(selectFilesClickEvent) => {
            selectFilesClickEvent.stopPropagation()
            handleBrowseClick()
          }}
          disabled={isUploading}
          className="mt-7 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-blue-500 disabled:cursor-wait disabled:bg-blue-600/50"
        >
          {isUploading ? (
            <>
              <SpinnerIcon className="h-4 w-4 animate-spin" />
              Procesando
            </>
          ) : (
            <>
              <PlusIcon className="h-4 w-4" />
              Select files
            </>
          )}
        </button>

        {shownError && (
          <p role="alert" className="mt-4 text-sm font-medium text-red-400">
            {shownError}
          </p>
        )}

        {file && (
          <div
            onClick={(fileChipClickEvent) => fileChipClickEvent.stopPropagation()}
            className="mt-6 flex w-full max-w-sm items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-100">{file.name}</p>
              <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
            </div>
            <button
              type="button"
              aria-label="Remove file"
              disabled={isUploading}
              onClick={handleRemoveFileClick}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
