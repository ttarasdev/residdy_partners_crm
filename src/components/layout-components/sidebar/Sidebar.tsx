'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    CalendarDays,
    Handshake,
    ShieldCheck,
    ChevronRight,
} from 'lucide-react'
import { navigation, roleLabel } from '../../../features/portal/config'
import { useAuth } from '../../../shared/hooks/useAuth'
import c from './Sidebar.module.scss'
export function Sidebar() {
    const pathname = usePathname()
    const { session } = useAuth()
    if (!session) return null
    const groups = [
        {
            name: session.role === 'PARTNERS' ? 'Partnerzy' : 'Konsultacje',
            Icon: session.role === 'PARTNERS' ? Handshake : CalendarDays,
            items: navigation[session.role],
        },
        {
            name: 'Konto',
            Icon: ShieldCheck,
            items: [
                { slug: 'profile', label: 'Mój profil' },
                { slug: 'security', label: 'Bezpieczeństwo' },
            ],
        },
    ]
    return (
        <aside className={c.sidebar}>
            <Link className={c.brand} href="/main">
                <span>
                    Residdy<span className={c.brandSmall}>Workflow</span>
                </span>
            </Link>
            <nav aria-label="Nawigacja główna" className={c.navigation}>
                <Link
                    href="/main"
                    className={c.home}
                    aria-current={
                        pathname === '/main' || pathname === '/main/overview'
                            ? 'page'
                            : undefined
                    }
                >
                    <LayoutDashboard size={17} />
                    Przegląd
                </Link>
                {groups.map(({ name, Icon, items }) => (
                    <details key={name} className={c.group} open>
                        <summary>
                            <Icon size={15} />
                            <span>{name}</span>
                            <ChevronRight size={13} />
                        </summary>
                        {items.map((item) => (
                            <Link
                                key={item.slug}
                                href={`/main/${item.slug}`}
                                className={c.link}
                                aria-current={
                                    pathname === `/main/${item.slug}` ||
                                    pathname.startsWith(`/main/${item.slug}/`)
                                        ? 'page'
                                        : undefined
                                }
                            >
                                {item.label}
                            </Link>
                        ))}
                    </details>
                ))}
            </nav>
            <footer className={c.footer}>
                <span className={c.dot} />
                {roleLabel[session.role]}
            </footer>
        </aside>
    )
}
