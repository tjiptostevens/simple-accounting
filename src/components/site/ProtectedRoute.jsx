import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Wraps any route that requires authentication.
 * While Supabase is resolving the session, shows a loading screen.
 * Once resolved, redirects unauthenticated users to the login page.
 */
const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-app-bg">
        <div className="text-primary text-lg animate-pulse">Loading…</div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
