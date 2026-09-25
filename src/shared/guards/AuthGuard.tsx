'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../hooks/useAuth'
import { Loading, Failure, Button } from '@/components/ui/Common'
export function AuthGuard({ children }: { children: React.ReactNode }) {
    const auth = useAuth()
    const router = useRouter()
    useEffect(() => {
        if (!auth.loading && !auth.token) router.replace('/auth')
    }, [auth.loading, auth.token, router])
    if (auth.loading || !auth.token) return <Loading />
    if (!auth.session)
        return (
            <>
                <Failure error={auth.error} retry={auth.retry} />
                <Button onClick={auth.logout}>Wróć do logowania</Button>
            </>
        )
    return children
}
