import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { AppShell } from '@/components/AppShell'
import { LoadingState } from '@/components/StatusStates'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { OverviewPage } from '@/pages/OverviewPage'
import { CustomersPage } from '@/pages/CustomersPage'
import { InterventionsPage } from '@/pages/InterventionsPage'
import { InterventionDetailPage } from '@/pages/InterventionDetailPage'
import { InsightsPage } from '@/pages/InsightsPage'
import { SettingsPage } from '@/pages/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-bone-50">
        <LoadingState message="Checking session..." />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}

function ProtectedShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/" element={<ProtectedShell><OverviewPage /></ProtectedShell>} />
        <Route path="/customers" element={<ProtectedShell><CustomersPage /></ProtectedShell>} />
        <Route path="/interventions" element={<ProtectedShell><InterventionsPage /></ProtectedShell>} />
        <Route path="/interventions/:id" element={<ProtectedShell><InterventionDetailPage /></ProtectedShell>} />
        <Route path="/insights" element={<ProtectedShell><InsightsPage /></ProtectedShell>} />
        <Route path="/settings" element={<ProtectedShell><SettingsPage /></ProtectedShell>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
