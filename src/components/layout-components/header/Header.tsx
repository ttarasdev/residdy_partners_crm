'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, LogOut, Moon, Sun, UserRound } from 'lucide-react'
import { useAuth } from '../../../shared/hooks/useAuth'
import { useTheme } from '../../../shared/theme/theme'
import { navigation } from '../../../features/portal/config'
import { Button } from '../../ui/Button'
import c from './Header.module.scss'
export function Header() {
    const pathname = usePathname()
    const { session, logout } = useAuth()
    const { theme, setTheme } = useTheme()
    const section = pathname.split('/')[2]
    const title =
        session &&
        navigation[session.role].find((item) => item.slug === section)?.label
    return (
        <header className={c.header}>
            <nav className={c.breadcrumb} aria-label="Ścieżka nawigacji">
                <Link href="/main">Workflow</Link>
                <ChevronRight size={14} />
                <span>
                    {title ||
                        (section === 'profile'
                            ? 'Mój profil'
                            : section === 'security'
                              ? 'Bezpieczeństwo'
                              : 'Przegląd')}
                </span>
            </nav>
            <div className={c.actions}>
                <Button
                    variant="ghost"
                    onClick={() =>
                        setTheme(theme === 'black' ? 'white' : 'black')
                    }
                    aria-label={
                        theme === 'black' ? 'Jasny motyw' : 'Ciemny motyw'
                    }
                >
                    {theme === 'black' ? <Sun size={18} /> : <Moon size={18} />}
                </Button>
                <Link href="/main/profile" className={c.profile}>
                    <span className={c.avatar}>
                        <UserRound size={17} />
                    </span>
                    <span>
                        {session?.profile.name || 'Moje konto'}
                        <small>
                            {session?.role === 'PARTNERS'
                                ? 'Partner'
                                : 'Specjalista'}
                        </small>
                    </span>
                </Link>
                <Button
                    variant="ghost"
                    onClick={logout}
                    aria-label="Wyloguj się"
                    title="Wyloguj się"
                >
                    <LogOut size={17} />
                </Button>
            </div>
        </header>
    )
}
