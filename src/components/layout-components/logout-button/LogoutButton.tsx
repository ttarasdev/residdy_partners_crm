'use client'

import { useAuth } from '../../../shared/hooks/useAuth'
import c from './LogoutButton.module.scss'

export function LogoutButton() {
    const { logout } = useAuth()

    return (
        <button type="button" className={c.button} onClick={logout}>
            Wyloguj się
        </button>
    )
}
