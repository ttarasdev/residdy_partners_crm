'use client'

import { useSyncExternalStore } from 'react'

export type Theme = 'white' | 'black'

const STORAGE_KEY = 'theme'

const THEME_EVENT = 'residdy:theme-changed'

function getTheme(): Theme {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY)

        if (stored === 'black' || stored === 'white') return stored

        // Read the previous frontend's persisted Zustand value as well.
        return stored && JSON.parse(stored)?.state?.theme === 'black'
            ? 'black'
            : 'white'
    } catch {
        return document.documentElement.dataset.theme === 'black'
            ? 'black'
            : 'white'
    }
}

function subscribe(listener: () => void) {
    const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY || event.key === null) listener()
    }

    window.addEventListener(THEME_EVENT, listener)

    window.addEventListener('storage', onStorage)

    return () => {
        window.removeEventListener(THEME_EVENT, listener)

        window.removeEventListener('storage', onStorage)
    }
}

export function setTheme(theme: Theme) {
    try {
        window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
        // The current tab can still change theme when storage is unavailable.
    }

    document.documentElement.dataset.theme = theme

    window.dispatchEvent(new Event(THEME_EVENT))
}

export function useTheme() {
    const theme = useSyncExternalStore(
        subscribe,
        getTheme,
        () => 'white' as const,
    )

    return { theme, setTheme }
}
