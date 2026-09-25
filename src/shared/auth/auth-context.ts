'use client'
import { createContext } from 'react'
import type { Session } from '@/api/portal'
export const AuthContext = createContext<{
    session: Session | undefined
    loading: boolean
    error: Error | null
    token: string | null
    logout: () => void
    retry: () => void
} | null>(null)
