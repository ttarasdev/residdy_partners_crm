'use client'
import { useState } from 'react'
import { useAuth } from '@/shared/hooks/useAuth'
import { accountAuthApi } from '@/api/accounts/account-auth/account-auth.api'
import Form, { type Field } from './Form'
import s from './portal.module.scss'
const current: Field = {
    name: 'currentPassword',
    label: 'Obecne hasło',
    type: 'password',
    required: true,
    maxLength: 128,
}
const code: Field = {
    name: 'code',
    label: 'Kod z wiadomości e-mail',
    required: true,
    pattern: '[0-9]{6}',
    maxLength: 6,
}
export default function Security() {
    const { logout } = useAuth()
    const [passwordStep, setPasswordStep] = useState(false)
    const [emailStep, setEmailStep] = useState(false)
    return (
        <>
            <div className={s.heading}>
                <div>
                    <h1>Bezpieczeństwo konta</h1>
                    <p>
                        Zmiana hasła i adresu e-mail wymaga potwierdzenia kodem
                        z wiadomości.
                    </p>
                </div>
            </div>
            <div className={s.grid}>
                <section className={s.card}>
                    <h2>Zmień hasło</h2>
                    <p className={s.notice}>
                        {passwordStep
                            ? 'Wpisz obecne hasło, kod i nowe hasło. Po zmianie zaloguj się ponownie.'
                            : 'Wyślemy kod potwierdzający na Twój obecny adres e-mail.'}
                    </p>
                    <Form
                        key={String(passwordStep)}
                        fields={
                            passwordStep
                                ? [
                                      current,
                                      code,
                                      {
                                          name: 'password',
                                          label: 'Nowe hasło',
                                          type: 'password',
                                          required: true,
                                          pattern: '.{8,128}',
                                          maxLength: 128,
                                      },
                                      {
                                          name: 'repeat',
                                          label: 'Powtórz nowe hasło',
                                          type: 'password',
                                          required: true,
                                          maxLength: 128,
                                      },
                                  ]
                                : [current]
                        }
                        label={
                            passwordStep
                                ? 'Potwierdź zmianę hasła'
                                : 'Otrzymaj kod'
                        }
                        submit={async (values) => {
                            if (!passwordStep) {
                                await accountAuthApi.requestPasswordChange({
                                    currentPassword: String(
                                        values.currentPassword,
                                    ),
                                })
                                setPasswordStep(true)
                            } else {
                                if (values.password !== values.repeat)
                                    throw new Error('Hasła nie są identyczne.')
                                await accountAuthApi.changePassword({
                                    currentPassword: String(
                                        values.currentPassword,
                                    ),
                                    code: String(values.code),
                                    password: String(values.password),
                                })
                                logout()
                            }
                        }}
                    />
                    {passwordStep && (
                        <button
                            className={s.back}
                            style={{ marginTop: 20 }}
                            onClick={() => setPasswordStep(false)}
                        >
                            Wyślij nowy kod
                        </button>
                    )}
                </section>
                <section className={s.card}>
                    <h2>Zmień adres e-mail</h2>
                    <p className={s.notice}>
                        {emailStep
                            ? 'Podaj ten sam nowy adres e-mail i wysłany na niego kod.'
                            : 'Kod potwierdzający zostanie wysłany na nowy adres.'}
                    </p>
                    <Form
                        key={String(emailStep)}
                        fields={[
                            current,
                            {
                                name: 'newEmail',
                                label: 'Nowy adres e-mail',
                                type: 'email',
                                required: true,
                                maxLength: 254,
                            },
                            ...(emailStep ? [code] : []),
                        ]}
                        label={
                            emailStep
                                ? 'Potwierdź nowy adres e-mail'
                                : 'Otrzymaj kod'
                        }
                        submit={async (values) => {
                            const dto = {
                                currentPassword: String(values.currentPassword),
                                newEmail: String(values.newEmail),
                            }
                            if (!emailStep) {
                                await accountAuthApi.requestEmailChange(dto)
                                setEmailStep(true)
                            } else {
                                await accountAuthApi.confirmEmailChange({
                                    ...dto,
                                    code: String(values.code),
                                })
                                logout()
                            }
                        }}
                    />
                    {emailStep && (
                        <button
                            className={s.back}
                            style={{ marginTop: 20 }}
                            onClick={() => setEmailStep(false)}
                        >
                            Wyślij nowy kod
                        </button>
                    )}
                </section>
            </div>
        </>
    )
}
