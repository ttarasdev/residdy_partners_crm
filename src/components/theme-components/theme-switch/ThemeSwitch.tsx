'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme, type Theme } from '../../../shared/theme/theme'
import c from './ThemeSwitch.module.scss'

export function ThemeSwitch({
    onChange,
    disabled = false,
}: {
    onChange?: (theme: Theme) => void
    disabled?: boolean
}) {
    const { theme, setTheme } = useTheme()

    return (
        <div className={c.theme} role="group" aria-label="Motyw kolorystyczny">
            <button
                type="button"
                aria-label="Ciemny motyw"
                aria-pressed={theme === 'black'}
                onClick={() => (onChange ?? setTheme)('black')}
                disabled={disabled}
                className={`${c.button} ${c.moon}`}
            >
                <Moon size={16} />
            </button>
            <button
                type="button"
                aria-label="Jasny motyw"
                aria-pressed={theme === 'white'}
                onClick={() => (onChange ?? setTheme)('white')}
                disabled={disabled}
                className={c.button}
            >
                <Sun size={16} />
            </button>
        </div>
    )
}
