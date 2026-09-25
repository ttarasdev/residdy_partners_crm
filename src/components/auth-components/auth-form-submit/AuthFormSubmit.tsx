import type { ReactNode } from 'react'
import c from './AuthFormSubmit.module.scss'

export function AuthFormSubmit({
    children,
    isLoading,
    pendingTitle,
}: {
    children: ReactNode
    isLoading: boolean
    pendingTitle: string
}) {
    return (
        <button
            type="submit"
            className={c.submit}
            disabled={isLoading}
            aria-busy={isLoading}
        >
            {isLoading ? pendingTitle : children}
        </button>
    )
}
