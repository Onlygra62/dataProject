import { NavLink } from 'react-router'
import { ChartBarIcon, CloudUploadIcon} from './icons'

const navItems = [
  { to: '/', label: 'Upload', icon: CloudUploadIcon, end: true },
  { to: '/analytics', label: 'Analytics', icon: ChartBarIcon },
]

export default function Sidebar() {
  return (
    <aside className="flex h-full w-16 flex-col items-center justify-between border-r border-white/5 bg-[#0a0e1a] py-4">
      <div className="flex flex-col items-center gap-2">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300">
          <ChartBarIcon className="h-5 w-5" />
        </div>

        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className={({ isActive }) =>
              `flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`
            }
          >
            <Icon className="h-5 w-5" />
          </NavLink>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
      </div>
    </aside>
  )
}
