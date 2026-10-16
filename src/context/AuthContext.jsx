import { createContext, useContext, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const USER_KEY = 'vistago-user'
const USERS_KEY = 'vistago-users'

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  } catch {
    return []
  }
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)

  const api = useMemo(() => {
    const signup = ({ name, email, phone, password }) => {
      const users = readUsers()
      if (users.some((entry) => entry.email.toLowerCase() === email.toLowerCase())) {
        return { ok: false, error: 'An account with this email already exists. Try signing in.' }
      }
      const nextUser = { name: name.trim(), email: email.trim(), phone }
      users.push({ ...nextUser, password })
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
      setUser(nextUser)
      return { ok: true }
    }

    const login = ({ email, password }) => {
      const found = readUsers().find(
        (entry) => entry.email.toLowerCase() === email.trim().toLowerCase() && entry.password === password,
      )
      if (!found) return { ok: false, error: 'Those details do not match an account.' }
      const nextUser = { name: found.name, email: found.email, phone: found.phone }
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
      setUser(nextUser)
      return { ok: true }
    }

    const logout = () => {
      localStorage.removeItem(USER_KEY)
      setUser(null)
    }

    return { user, signup, login, logout }
  }, [user])

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
