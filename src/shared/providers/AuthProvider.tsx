'use client'
import { useSyncExternalStore, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
    clearAccessToken,
    getAccessToken,
    subscribeAccessToken,
} from '@/api/auth-token'
import { fetchSession } from '@/api/portal'
import { AuthContext } from '../auth/auth-context'
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const token = useSyncExternalStore(
        subscribeAccessToken,
        getAccessToken,
        () => null,
    )
    const ready = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    )
    const client = useQueryClient()
    const query = useQuery({
        queryKey: ['session', token],
        queryFn: ({ signal }) => fetchSession(token!, signal),
        enabled: Boolean(token),
        retry: false,
        staleTime: 60000,
        refetchInterval: 300000,
        refetchOnWindowFocus: 'always',
    })
    useEffect(() => {
        if (!token) client.removeQueries({ queryKey: ['portal'] })
        client.removeQueries({
            predicate: (q) =>
                q.queryKey[0] === 'session' && q.queryKey[1] !== token,
        })
    }, [client, token])
    const logout = () => {
        clearAccessToken()
        client.clear()
    }
    return (
        <AuthContext.Provider
            value={{
                session: query.isError ? undefined : query.data,
                loading: !ready || Boolean(token && query.isPending),
                error: query.error,
                token,
                logout,
                retry: () => {
                    void query.refetch()
                },
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
