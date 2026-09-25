'use client'
import { useAuth } from '../hooks/useAuth'
import { canAccess } from '@/features/portal/config'
export function RoleGuard({
    section,
    children,
    fallback,
}: {
    section: string
    children: React.ReactNode
    fallback: React.ReactNode
}) {
    const { session } = useAuth()
    return session && canAccess(session.role, section) ? children : fallback
}
