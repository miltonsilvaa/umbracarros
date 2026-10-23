import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { createContext, useEffect, useState, type ReactNode } from 'react'
import { auth } from '../services/firebaseConnection'

interface UserProps {
  uid: string
  name: string
  email: string
}

interface AuthContextData {
  signed: boolean
  loadingAuth: boolean
  user: UserProps | null
  handleLogin: (email: string, password: string) => Promise<void>
  handleRegister: (name: string, email: string, password: string) => Promise<void>
  handleLogout: () => Promise<void>
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProps | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          name: currentUser.displayName ?? '',
          email: currentUser.email ?? '',
        })
      } else {
        setUser(null)
      }
      setLoadingAuth(false)
    })

    return () => unsubscribe()
  }, [])

  async function handleLogin(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function handleRegister(name: string, email: string, password: string) {
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(credential.user, { displayName: name })
    setUser({ uid: credential.user.uid, name, email })
  }

  async function handleLogout() {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider
      value={{ signed: !!user, loadingAuth, user, handleLogin, handleRegister, handleLogout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
