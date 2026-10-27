import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { StudyDataProvider } from './context/StudyDataContext'
import { TimerProvider } from './context/TimerContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import PlaceholderPage from './components/PlaceholderPage'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Assignments from './pages/Assignments'
import Modules from './pages/Modules'
import Grades from './pages/Grades'
import Focus from './pages/Focus'
import Settings from './pages/Settings'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<StudyDataProvider />}>
              <Route element={<TimerProvider />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/modules" element={<Modules />} />
                  <Route path="/assignments" element={<Assignments />} />
                  <Route path="/calendar" element={<PlaceholderPage title="Calendar" />} />
                  <Route path="/grades" element={<Grades />} />
                  <Route path="/focus" element={<Focus />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<PlaceholderPage title="Page not found" />} />
                </Route>
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App