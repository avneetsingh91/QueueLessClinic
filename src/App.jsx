import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { QueueProvider } from './context/QueueContext'
import ProtectedRoute from './routes/ProtectedRoute'
import ErrorBoundary from './components/common/ErrorBoundary'
import DashboardLayout from './components/layout/DashboardLayout'
import LandingPage from './pages/LandingPage'
import QueuePage from './pages/QueuePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import LiveQueuePage from './pages/LiveQueuePage'
import TokenManagementPage from './pages/TokenManagementPage'
import DoctorsPage from './pages/DoctorsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/queue/:slug" element={<QueuePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <QueueProvider>
                    <DashboardLayout />
                  </QueueProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="live" element={<LiveQueuePage />} />
              <Route path="tokens" element={<TokenManagementPage />} />
              <Route
                path="doctors"
                element={
                  <ProtectedRoute adminOnly>
                    <DoctorsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route
                path="settings"
                element={
                  <ProtectedRoute adminOnly>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
