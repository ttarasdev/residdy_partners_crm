'use client'
import { useState } from 'react'
import {
    AlertCircle,
    Inbox,
    LoaderCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'
import { Button as BaseButton } from './Button'
import ui from './ui.module.scss'
import { statuses } from '@/features/portal/config'
import { ApiError } from '@/api/api-error'
import s from '@/features/portal/components/portal.module.scss'
export function Button({
    secondary,
    danger,
    className = '',
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    secondary?: boolean
    danger?: boolean
}) {
    return (
        <BaseButton
            {...props}
            variant={danger ? 'danger' : secondary ? 'secondary' : 'primary'}
            className={className}
        />
    )
}
export function Badge({ status }: { status: string }) {
    return (
        <span
            className={ui.badge}
            data-tone={
                ['active', 'published', 'paid', 'open', 'approved'].includes(
                    status,
                )
                    ? 'success'
                    : 'default'
            }
        >
            {statuses[status] ?? 'Nieznany status'}
        </span>
    )
}
export function errorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        if (error.status === 401)
            return error.url.includes('/account-auth/login')
                ? 'Sprawdź adres e-mail i hasło lub skontaktuj się z menedżerem w sprawie statusu konta.'
                : error.url.includes('/account-auth/')
                  ? 'Obecne hasło jest nieprawidłowe lub sesja wygasła.'
                  : 'Sesja wygasła. Zaloguj się ponownie.'
        if (error.status === 403)
            return 'Brak uprawnień lub dostęp do konta jest ograniczony.'
        if (error.status === 404)
            return 'Nie znaleziono rekordu lub nie jest już dostępny.'
        if (error.status === 429)
            return 'Zbyt wiele żądań. Spróbuj ponownie później.'
        if (error.status === 400 || error.status === 422)
            return 'Nieprawidłowe dane. Sprawdź wymagane pola i spróbuj ponownie.'
        if (error.status === 409)
            return 'Nie można wykonać tej operacji w obecnym stanie. Odśwież dane i sprawdź powiązane rekordy.'
        if (error.status === 410)
            return 'Ten plik lub rekord nie jest już dostępny.'
        if (error.status === 413)
            return 'Plik jest zbyt duży. Wybierz mniejszy plik.'
        return 'Nie udało się wykonać operacji. Spróbuj ponownie później.'
    }
    if (error instanceof TypeError)
        return 'Nie udało się połączyć z serwerem. Sprawdź połączenie i spróbuj ponownie.'
    if (error instanceof Error && error.name === 'ApiResponseError')
        return 'Serwer zwrócił nieprawidłową odpowiedź. Spróbuj ponownie.'
    return error instanceof Error
        ? error.message
        : 'Nie udało się wykonać żądania.'
}
export function ErrorBox({ error }: { error: unknown }) {
    return (
        <div role="alert" className={s.error}>
            {errorMessage(error)}
        </div>
    )
}
export function Loading() {
    return (
        <div className={s.state} role="status">
            <LoaderCircle size={24} />
            <p>Ładowanie danych…</p>
        </div>
    )
}
export function Failure({
    error,
    retry,
}: {
    error: unknown
    retry?: () => void
}) {
    return (
        <div className={s.state}>
            <AlertCircle size={28} />
            <h2>Nie udało się załadować danych</h2>
            <ErrorBox error={error} />
            {retry && (
                <Button secondary onClick={retry}>
                    Spróbuj ponownie
                </Button>
            )}
        </div>
    )
}
export function Empty({
    title = 'Tu jeszcze nic nie ma',
    text = 'Rekordy pojawią się tutaj po dodaniu.',
}: {
    title?: string
    text?: string
}) {
    return (
        <div className={s.state}>
            <Inbox size={30} />
            <h2>{title}</h2>
            <p>{text}</p>
        </div>
    )
}
export function Pagination({
    page,
    total,
    limit = 20,
    onChange,
}: {
    page: number
    total: number
    limit?: number
    onChange: (n: number) => void
}) {
    const count = Math.max(1, Math.ceil(total / limit))
    return (
        <div className={s.pagination}>
            <span>
                Łącznie: {total} · Strona {page} z {count}
            </span>
            <div className={s.row}>
                <Button
                    secondary
                    disabled={page <= 1}
                    onClick={() => onChange(page - 1)}
                    aria-label="Poprzednia strona"
                >
                    <ChevronLeft size={16} />
                </Button>
                <Button
                    secondary
                    disabled={page >= count}
                    onClick={() => onChange(page + 1)}
                    aria-label="Następna strona"
                >
                    <ChevronRight size={16} />
                </Button>
            </div>
        </div>
    )
}
export function Action({
    label,
    run,
    confirm,
    danger,
}: {
    label: string
    run: () => Promise<unknown>
    confirm?: string
    danger?: boolean
}) {
    const [pending, setPending] = useState(false)
    const [error, setError] = useState<unknown>()
    const [done, setDone] = useState(false)
    async function execute() {
        if (confirm && !window.confirm(confirm)) return
        setPending(true)
        setError(undefined)
        setDone(false)
        try {
            await run()
            setDone(true)
        } catch (e) {
            setError(e)
        } finally {
            setPending(false)
        }
    }
    return (
        <div className={s.stack}>
            <Button
                secondary={!danger}
                danger={danger}
                disabled={pending}
                onClick={() => void execute()}
            >
                {pending ? 'Przetwarzanie…' : label}
            </Button>
            {Boolean(error) && <ErrorBox error={error} />}
            {done && (
                <span role="status" className={s.muted}>
                    Gotowe
                </span>
            )}
        </div>
    )
}
