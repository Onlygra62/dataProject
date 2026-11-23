// Contenedor con el borde y el fondo de las tarjetas de la app. El padding y cualquier
// otro ajuste se pasan por className.
export default function Card({ className = '', ...props }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/3 ${className}`.trim()}
      {...props}
    />
  )
}
