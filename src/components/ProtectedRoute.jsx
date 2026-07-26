import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export default function ProtectedRoute({ children }) {
const {isAuthenticated, tokenExpired } = useAuth()
  console.log("ProtectedRoute:", {

    isAuthenticated,

    tokenExpired,

  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  
  return children
}
