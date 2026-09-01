import { createBrowserRouter } from 'react-router'
import App from './App.jsx'
import UploadPage from './pages/UploadPage'
import AnalyticsPage from './pages/AnalyticsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <UploadPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
    ],
  },
])

export default router
