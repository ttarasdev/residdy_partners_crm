'use client'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RoleGuard } from '../../../shared/guards/RoleGuard'
import { Header } from '../header/Header'
import { Sidebar } from '../sidebar/Sidebar'
import c from './AppShell.module.scss'
export function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const section = pathname.split('/')[2] || 'overview'
    return (
        <div className={c.shell}>
            <Sidebar />
            <div className={c.body}>
                <Header />
                <main className={c.content} key={pathname}>
                    <RoleGuard
                        section={section}
                        fallback={
                            <section className={c.denied}>
                                <h1>Strona niedostępna</h1>
                                <p>
                                    Ta sekcja nie jest dostępna dla Twojego
                                    konta.
                                </p>
                                <Link href="/main">Strona główna</Link>
                            </section>
                        }
                    >
                        {children}
                    </RoleGuard>
                </main>
            </div>
        </div>
    )
}
