import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { OwnerSubscriptionProvider } from './context/OwnerSubscriptionContext'
import { ToastProvider } from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Spinner from './components/Spinner'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Members = lazy(() => import('./pages/Members'))
const MemberDetail = lazy(() => import('./pages/MemberDetail'))
const Memberships = lazy(() => import('./pages/Memberships'))
const Plans = lazy(() => import('./pages/Plans'))
const Payments = lazy(() => import('./pages/Payments'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Settings = lazy(() => import('./pages/Settings'))
const GymSetup = lazy(() => import('./pages/GymSetup'))
const Customization = lazy(() => import('./pages/ThemeCustomization'))
// const WebsiteBuilder = lazy(() => import('./pages/WebsiteBuilder'))
const GymSite = lazy(() => import('./public/GymSite'))
const Leads = lazy(() => import('./pages/Leads'))

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/g/:slug" element={<GymSite />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<Members />} />
          <Route path="members/:id" element={<MemberDetail />} />
          <Route path="memberships" element={<Memberships />} />
          <Route path="plans" element={<Plans />} />
          <Route path="billing" element={<Payments />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="setup" element={<GymSetup />} />
          <Route path="customization" element={<Customization />} />
          {/* <Route path="website" element={<WebsiteBuilder />} /> */}
          <Route path="leads" element={<Leads />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ToastProvider>
          <AuthProvider>
            <OwnerSubscriptionProvider>
              <AppRoutes />
            </OwnerSubscriptionProvider>
          </AuthProvider>
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
