'use client'
import { useContext } from 'react'
import { AuthContext } from '../auth/auth-context'
export function useAuth() {
    const value = useContext(AuthContext)
    if (!value) throw new Error('Missing auth provider')
    return value
}
