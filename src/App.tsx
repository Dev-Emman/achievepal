import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { StudyDataProvider } from './context/StudyDataContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import PlaceholderPage from './components/PlaceholderPage'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Assignments from './pages/Assignments'
import Modules from './pages/Modules'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<StudyDataProvider />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/modules" element={<Modules />} />
                <Route path="/assignments" element={<Assignments />} />
                <Route path="/calendar" element={<PlaceholderPage title="Calendar" />} />
                <Route path="/grades" element={<PlaceholderPage title="Grades" />} />
                <Route path="*" element={<PlaceholderPage title="Page not found" />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App