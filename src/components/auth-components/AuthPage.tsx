'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { accountAuthApi } from '@/api/accounts/account-auth/account-auth.api'
import { setAccessToken } from '@/api/auth-token'
import { fetchSession } from '@/api/portal'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/shared/hooks/useAuth'
import { Button, ErrorBox } from '@/components/ui/Common'
import { AuthShell } from '@/components/auth-components/auth-shell/AuthShell'
import { AuthFormInput } from '@/components/auth-components/auth-form-input/AuthFormInput'
import { AuthFormSubmit } from '@/components/auth-components/auth-form-submit/AuthFormSubmit'
import s from '@/components/auth-components/auth-shell/AuthShell.module.scss'
export type AuthMode = 'login' | 'confirm' | 'forgot' | 'reset'
const titles = {
    login: 'Miło Cię znowu widzieć',
    confirm: 'Potwierdź konto',
    forgot: 'Odzyskiwanie dostępu',
    reset: 'Nowe hasło',
}
export default function AuthPage({ mode = 'login' }: { mode?: AuthMode }) {
    const router = useRouter()
    const client = useQueryClient()
    const auth = useAuth()
    const [pending, setPending] = useState(false)
    const [error, setError] = useState<unknown>()
    const [message, setMessage] = useState('')
    const [email, setEmail] = useState('')
    useEffect(() => {
        if (mode === 'login' && auth.session) router.replace('/main')
    }, [auth.session, mode, router])
    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setPending(true)
        setError(undefined)
        setMessage('')
        const form = new FormData(event.currentTarget)
        const password = String(form.get('password') ?? '')
        const code = String(form.get('code') ?? '')
        try {
            if (mode === 'login') {
                const { token } = await accountAuthApi.login({
                    email,
                    password,
                })
                if (!token || typeof token !== 'string')
                    throw new Error('Serwer nie zwrócił tokenu dostępu.')
                const session = await fetchSession(token)
                client.clear()
                client.setQueryData(['session', token], session)
                setAccessToken(token)
                router.replace('/main')
            }
            if (mode === 'forgot') {
                await accountAuthApi.forgotPassword({ email })
                setMessage(
                    'Jeśli konto istnieje, kod odzyskiwania został wysłany na Twój adres e-mail.',
                )
            }
            if (mode === 'confirm') {
                await accountAuthApi.confirm({ email, code })
                setMessage('Konto zostało potwierdzone. Możesz się zalogować.')
            }
            if (mode === 'reset') {
                if (password !== form.get('repeat'))
                    throw new Error('Hasła nie są identyczne.')
                await accountAuthApi.resetPassword({ email, code, password })
                setMessage('Hasło zostało zmienione. Zaloguj się nowym hasłem.')
            }
        } catch (e) {
            setError(e)
        } finally {
            setPending(false)
        }
    }
    async function resend() {
        setPending(true)
        setError(undefined)
        try {
            await accountAuthApi.resend({ email })
            setMessage('Kod potwierdzający został wysłany ponownie.')
        } catch (e) {
            setError(e)
        } finally {
            setPending(false)
        }
    }
    return (
        <AuthShell
            title={titles[mode]}
            subtitle={
                mode === 'login'
                    ? 'Zaloguj się służbowym adresem e-mail. Otworzymy panel odpowiedni dla Twojego konta.'
                    : 'Użyj adresu e-mail podanego menedżerowi.'
            }
            linkHref={mode === 'login' ? '/forgot-password' : '/auth'}
            linkTitle={
                mode === 'login' ? 'Nie pamiętasz hasła?' : 'Wróć do logowania'
            }
        >
            <form
                method="post"
                className={s.form}
                onSubmit={submit}
                aria-busy={pending}
            >
                <AuthFormInput
                    labelTitle="Adres e-mail"
                    iconPath="/auth/email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    value={email}
                    onChange={setEmail}
                    disabled={pending || auth.loading}
                />
                {(mode === 'confirm' || mode === 'reset') && (
                    <AuthFormInput
                        labelTitle="Kod z wiadomości e-mail"
                        iconPath="/auth/key"
                        name="code"
                        onChange={() => {}}
                        pattern="[0-9]{6}"
                        maxLength={6}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        required
                        disabled={pending || auth.loading}
                    />
                )}
                {(mode === 'login' || mode === 'reset') && (
                    <AuthFormInput
                        labelTitle="Hasło"
                        iconPath="/auth/key"
                        type="password"
                        name="password"
                        onChange={() => {}}
                        autoComplete={
                            mode === 'login'
                                ? 'current-password'
                                : 'new-password'
                        }
                        required
                        minLength={mode === 'reset' ? 8 : undefined}
                        maxLength={128}
                        disabled={pending || auth.loading}
                    />
                )}
                {mode === 'reset' && (
                    <AuthFormInput
                        labelTitle="Powtórz hasło"
                        iconPath="/auth/key"
                        type="password"
                        name="repeat"
                        onChange={() => {}}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        maxLength={128}
                        disabled={pending || auth.loading}
                    />
                )}
                {Boolean(error) && <ErrorBox error={error} />}
                {message && <p role="status">{message}</p>}
                <AuthFormSubmit
                    isLoading={pending || auth.loading}
                    pendingTitle="Poczekaj…"
                >
                    {mode === 'login'
                        ? 'Zaloguj się'
                        : mode === 'forgot'
                          ? 'Wyślij kod'
                          : mode === 'confirm'
                            ? 'Potwierdź konto'
                            : 'Zmień hasło'}
                </AuthFormSubmit>
                {mode === 'confirm' && (
                    <Button
                        type="button"
                        secondary
                        disabled={!email || pending || auth.loading}
                        onClick={() => void resend()}
                    >
                        Wyślij kod ponownie
                    </Button>
                )}
                {mode === 'login' && (
                    <Link href="/confirm-account">Potwierdź konto</Link>
                )}
                {mode === 'forgot' && (
                    <Link href="/reset-password">Mam już kod →</Link>
                )}
            </form>
        </AuthShell>
    )
}
