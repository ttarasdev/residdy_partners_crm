import type { ButtonHTMLAttributes } from 'react'
import c from './ui.module.scss'

export function Button({
    variant = 'secondary',
    className = '',
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
}) {
    return (
        <button
            type="button"
            {...props}
            className={`${c.button} ${c[variant]} ${className}`}
        />
    )
}
