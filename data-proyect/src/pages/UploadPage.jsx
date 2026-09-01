import { useState } from 'react'
import { useNavigate } from 'react-router'
import UploadZone from '../components/UploadZone'
import { uploadDataset } from '../api/datasets'
import { useDataset } from '../context/DatasetContext'

export default function UploadPage() {
  const navigate = useNavigate()
  const { setDataset } = useDataset()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const handleFileAccepted = async (file) => {
    setIsUploading(true)
    setUploadError('')

    try {
      // La respuesta trae el dataframe completo; solo necesitamos el id, las
      // filas se piden paginadas desde la pantalla de analytics.
      const { dataset_id: datasetId } = await uploadDataset(file)
      setDataset({ id: datasetId, name: file.name, size: file.size, uploadedAt: Date.now() })
      navigate('/analytics')
    } catch (error) {
      setUploadError(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 py-16">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-100 sm:text-5xl">
          Drop &amp; Analyze
        </h1>
        <p className="mt-4 text-slate-400">
          Upload your raw datasets to begin processing and analysis. Supported formats ensure
          data integrity during the import phase.
        </p>
      </div>

      <div className="mt-10 w-full max-w-2xl">
        <UploadZone
          onFileAccepted={handleFileAccepted}
          isUploading={isUploading}
          uploadError={uploadError}
        />
      </div>
    </div>
  )
}
