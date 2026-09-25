'use client'
import { useEffect } from 'react'
import { useTheme } from './theme'
export function ThemeProvider() {
    const { theme } = useTheme()
    useEffect(() => {
        document.documentElement.dataset.theme = theme
    }, [theme])
    return null
}
