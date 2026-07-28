'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  getIdToken,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { setCookie, deleteCookie } from 'cookies-next'

export interface AppUser {
  id: string
  email: string
  name: string
  role: 'OWNER' | 'MANAGER'
  department?: string
  departmentId?: string
  factoryId?: string
}

interface AuthState {
  user: AppUser | null
  firebaseUser: FirebaseUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ error?: string }>
  register: (email: string, password: string, name: string, role: 'OWNER' | 'MANAGER', factoryId?: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

import { apiGet } from '@/lib/api'

async function fetchProfile(uid: string): Promise<AppUser | null> {
  try {
    const res: any = await apiGet('/auth/me')
    if (res && res.id) {
      return {
        id: res.id,
        email: res.email,
        name: res.name,
        role: res.role as AppUser['role'],
        department: res.department ?? undefined,
        departmentId: res.departmentId ?? undefined,
        factoryId: res.factoryId ?? undefined,
      }
    }
  } catch (err: any) {
    console.warn("Backend profile fetch failed, trying direct Firestore:", err);
  }

  try {
    const docSnap = await getDoc(doc(db, 'users', uid))
    if (!docSnap.exists()) return null
    const data = docSnap.data()
    return {
      id: uid,
      email: data.email,
      name: data.name,
      role: data.role as AppUser['role'],
      department: data.department ?? undefined,
      departmentId: data.departmentId ?? undefined,
      factoryId: data.factoryId ?? undefined,
    }
  } catch (err: any) {
    console.error("Error fetching profile:", err);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    firebaseUser: null,
    isAuthenticated: false,
    isLoading: true,
  })

  const updateTokenCookie = async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const token = await getIdToken(firebaseUser)
      setCookie('__session', token, {
        maxAge: 60 * 60, // 1 hour
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    } else {
      deleteCookie('__session', { path: '/' })
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await updateTokenCookie(firebaseUser)
        const profile = await fetchProfile(firebaseUser.uid)
        if (profile) {
          setState({
            user: profile,
            firebaseUser,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          setState({
            user: null,
            firebaseUser: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      } else {
        await updateTokenCookie(null)
        setState({
          user: null,
          firebaseUser: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const token = await getIdToken(cred.user)
      setCookie('__session', token, {
        maxAge: 60 * 60,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      // Fetch profile to get role and set role cookie for middleware fallback
      const profile = await fetchProfile(cred.user.uid)
      const role = profile?.role || 'OWNER'
      setCookie('user_role', role, {
        maxAge: 60 * 60,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      return {}
    } catch (err: any) {
      return { error: 'Invalid email or password' }
    }
  }

  const register = async (
    email: string,
    password: string,
    name: string,
    role: 'OWNER' | 'MANAGER',
    factoryId?: string
  ): Promise<{ error?: string }> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      
      // Save profile to Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        name,
        role,
        factoryId: factoryId || null,
        createdAt: new Date().toISOString()
      })

      const token = await getIdToken(cred.user)
      setCookie('__session', token, {
        maxAge: 60 * 60,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      setCookie('user_role', role, {
        maxAge: 60 * 60,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      
      await refreshUser()
      return {}
    } catch (err: any) {
      return { error: err.message || 'Registration failed' }
    }
  }


  const logout = async () => {
    deleteCookie('__session', { path: '/' })
    await signOut(auth)
    setState({
      user: null,
      firebaseUser: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  const refreshUser = async () => {
    const currentUser = auth.currentUser
    if (currentUser) {
      const profile = await fetchProfile(currentUser.uid)
      if (profile) {
        setState({
          user: profile,
          firebaseUser: currentUser,
          isAuthenticated: true,
          isLoading: false,
        })
      }
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
