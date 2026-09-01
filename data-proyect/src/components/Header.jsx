
export default function Header({ title = 'Data Proyect' }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-[#0a0e1a] px-6">
      <h1 className="text-lg font-bold tracking-tight text-slate-100">{title}</h1>

      <div className="flex items-center gap-2">


      </div>
    </header>
  )
}
