import { Outlet } from 'react-router'
import Sidebar from './components/Sidebar'
import Header from './components/Header'

export default function App() {
  return (
    <div className="flex h-screen bg-[#080b14]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <Outlet />
      </div>
    </div>
  )
}
