import { useMemo, useState } from 'react'
import { authService } from '../services'
import { AuthContext } from './authContextStore'

const TOKEN_STORAGE_KEY = 'conjur.accessToken'


export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')


  const setAccessToken = (accessToken) => {
    const normalizedToken = accessToken.trim();
    setToken(normalizedToken);
    localStorage.setItem(TOKEN_STORAGE_KEY, normalizedToken);
    return normalizedToken;
  };

  const login = async (credentials) => {
    setLoading(true)
    setError('')

    try {
      const accessToken = await authService.login(credentials)
      return setAccessToken(accessToken)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Login failed.'
      setError(message)
      throw requestError
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken('')
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem('conjur.account')
  }

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      loading,
      error,
      login,
      logout,
      setAccessToken,
    }),
    [token, loading, error],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
