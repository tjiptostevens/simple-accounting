import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import ProtectedRoute from './components/site/ProtectedRoute'
import { useAuth } from './context/AuthContext'

// Lazy-loaded top-level pages
const Login = lazy(() => import('./components/site/login'))
const Home  = lazy(() => import('./components/home'))

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-app-bg">
    <span className="text-primary animate-pulse">Loading…</span>
  </div>
)

function AppRoutes() {
  const { session, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route
          path="/"
          element={session ? <Navigate to="/d" replace /> : <Login />}
        />
        <Route
          path="/d/*"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

export default App

