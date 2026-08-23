import UploadZone from '../components/UploadZone'

export default function UploadPage() {
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
        <UploadZone onFileAccepted={(file) => console.log('File accepted:', file)} />
      </div>
    </div>
  )
}
