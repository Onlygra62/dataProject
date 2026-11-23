const BASE = 'inline-flex items-center gap-2 rounded-lg text-sm transition-colors'

// El boton principal grande (lg) va en mayusculas porque es la accion central de la pantalla.
const VARIANTS = {
  primary: {
    colors: 'bg-blue-600 text-white hover:bg-blue-500 disabled:cursor-wait disabled:bg-blue-600/50',
    md: 'px-4 py-2.5 font-semibold',
    lg: 'px-6 py-3 font-bold tracking-wide uppercase',
  },
  secondary: {
    colors: 'border border-white/10 text-slate-200 hover:bg-white/5',
    md: 'px-4 py-2.5 font-semibold',
    lg: 'px-6 py-3 font-semibold',
  },
}

// Clases de un boton. Estan separadas del componente para poder aplicarlas tambien a un
// <Link>, que se ve como boton pero no es un <button>.
export function buttonClass({ variant = 'primary', size = 'md', className = '' } = {}) {
  const style = VARIANTS[variant]
  return `${BASE} ${style.colors} ${style[size]} ${className}`.trim()
}
