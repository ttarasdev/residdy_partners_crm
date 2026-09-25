'use client'
import { useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '../query/create-query-client'
import { AuthProvider } from './AuthProvider'
import { ThemeProvider } from '../theme/ThemeProvider'
export function Providers({ children }: { children: React.ReactNode }) {
    const [client] = useState(createQueryClient)
    return (
        <QueryClientProvider client={client}>
            <AuthProvider>
                <ThemeProvider />
                {children}
            </AuthProvider>
        </QueryClientProvider>
    )
}
