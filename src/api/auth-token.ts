const STORAGE_KEY = 'residdy_portal_access_token'

const TOKEN_EVENT = 'residdy:access-token-changed'

export function subscribeAccessToken(listener: () => void): () => void {
    const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY || event.key === null) listener()
    }

    window.addEventListener(TOKEN_EVENT, listener)

    window.addEventListener('storage', onStorage)

    return () => {
        window.removeEventListener(TOKEN_EVENT, listener)

        window.removeEventListener('storage', onStorage)
    }
}

/** Browser storage only. Server callers must pass options.token per request. */
export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null

    return window.localStorage.getItem(STORAGE_KEY)
}

export function setAccessToken(token: string): void {
    if (typeof window === 'undefined') {
        throw new Error('setAccessToken is only available in the browser')
    }

    window.localStorage.setItem(STORAGE_KEY, token)

    window.dispatchEvent(new Event(TOKEN_EVENT))
}

export function clearAccessToken(): void {
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY)

        window.dispatchEvent(new Event(TOKEN_EVENT))
    }
}
