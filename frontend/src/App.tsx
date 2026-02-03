import { Navigate, Route, Routes } from 'react-router-dom'

import { Layout } from './components/Layout'
import { ThemeProvider } from './contexts/ThemeContext'
import { EducationPage } from './pages/EducationPage'
import { HomePage } from './pages/HomePage'
import { OptionsPage } from './pages/OptionsPage'
import { VolatilitySurfacePage } from './pages/VolatilitySurfacePage'
import { WatchlistPage } from './pages/WatchlistPage'

export default function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/options" element={<OptionsPage />} />
          <Route path="/education" element={<EducationPage />} />
          <Route path="/volatility" element={<VolatilitySurfacePage />} />
          <Route path="/watchlist" element={<WatchlistPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  )
}
