import { Outlet } from 'react-router'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import DatasetProvider from './context/DatasetProvider'

export default function App() {
  return (
    <DatasetProvider>
      <div className="flex h-screen bg-[#080b14]">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <Outlet />
        </div>
      </div>
    </DatasetProvider>
  )
}
