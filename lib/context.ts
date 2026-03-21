import { createContext } from 'react'

export const AuthContext = createContext<{
  token: string | null
  user: any
  handleLogin: (token: string, user: any) => void
  handleLogout: () => void
}>({
  token: null,
  user: null,
  handleLogin: () => {},
  handleLogout: () => {},
})
