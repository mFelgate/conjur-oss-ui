import { useContext } from 'react'
import { AuthContext } from './authContextStore'

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

export const setAccessToken = (accessToken) => {
  const normalizedToken = accessToken.trim();
  setToken(normalizedToken);
  localStorage.setItem(TOKEN_STORAGE_KEY, normalizedToken);
  return normalizedToken;
};

