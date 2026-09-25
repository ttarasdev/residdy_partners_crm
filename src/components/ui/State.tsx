import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react'
import { Button } from './Button'
import c from './ui.module.scss'

export function State({
    loading,
    error,
    empty = 'Brak wyników',
    onRetry,
}: {
    loading?: boolean
    error?: Error | null
    empty?: string
    onRetry?: () => void
}) {
    return (
        <div className={c.state} role={error ? 'alert' : 'status'}>
            {loading ? (
                <LoaderCircle className={c.spin} />
            ) : error ? (
                <AlertCircle />
            ) : (
                <Inbox />
            )}
            <strong>
                {loading
                    ? 'Ładowanie danych…'
                    : error
                      ? 'Nie udało się pobrać danych'
                      : empty}
            </strong>
            {error && (
                <>
                    <p>{error.message}</p>
                    {onRetry && (
                        <Button onClick={onRetry}>Spróbuj ponownie</Button>
                    )}
                </>
            )}
        </div>
    )
}
