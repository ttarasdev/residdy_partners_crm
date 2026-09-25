import Link from 'next/link'
import type { ReactNode } from 'react'
import { AuthFormHeader } from '../auth-form-header/AuthFormHeader'
import { ThemeSwitch } from '../../theme-components/theme-switch/ThemeSwitch'
import { ThemedIcon } from '../../theme-components/themed-icon/ThemedIcon'
import c from './AuthShell.module.scss'

interface Props {
    title: string
    subtitle: string
    children: ReactNode
    linkHref: string
    linkTitle: string
}

export function AuthShell({
    title,
    subtitle,
    children,
    linkHref,
    linkTitle,
}: Props) {
    return (
        <main className={c.container}>
            <ThemedIcon
                path="/logo_large"
                width={203}
                height={60}
                alt="Residdy"
            />
            <AuthFormHeader title={title} subtitle={subtitle} />
            {children}
            <Link href={linkHref}>{linkTitle}</Link>
            <ThemeSwitch />
        </main>
    )
}
