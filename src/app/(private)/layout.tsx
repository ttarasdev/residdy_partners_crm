import type { ReactNode } from 'react'
import { AppShell } from '@/components/layout-components/app-shell/AppShell'
import { AuthGuard } from '@/shared/guards/AuthGuard'
export default function PrivateLayout({ children }: { children: ReactNode }) {
    return (
        <AuthGuard>
            <AppShell>{children}</AppShell>
        </AuthGuard>
    )
}
