'use client'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/shared/hooks/useAuth'
import { http } from '@/api/http'
import type { Specialist } from '@/api/specialists/specialists/specialists.types'
import Form from './Form'
import { contactFields, specialistFields } from '../resources'
import Media from './Media'
import SpecialistTranslations from './SpecialistTranslations'
import s from './portal.module.scss'
export default function Profile() {
    const { session } = useAuth()
    const client = useQueryClient()
    const { profile, account, role } = session!
    const path = role === 'PARTNERS' ? '/partners/me' : '/specialists/me'
    return (
        <>
            <div className={s.heading}>
                <div>
                    <h1>Mój profil</h1>
                    <p>Dane osobowe i informacje o Tobie w Residdy.</p>
                </div>
            </div>
            <div className={s.stack}>
                <section className={s.card}>
                    <h2>Dane kontaktowe</h2>
                    <p className={s.notice}>{account.email}</p>
                    <Form
                        fields={contactFields}
                        initial={profile}
                        submit={async (values) => {
                            await http.patch(path, values)
                            await client.invalidateQueries({
                                queryKey: ['session'],
                            })
                        }}
                    />
                </section>
                <Media
                    title="Zdjęcie profilowe"
                    path="/account/me/avatar"
                    id={account.avatarId}
                />
                {role === 'SPECIALISTS' && <SpecialistTranslations info={(profile as Specialist).info} />}
                {role === 'SPECIALISTS' && (
                    <section className={s.card}>
                        <h2>Profil zawodowy</h2>
                        <p className={s.notice}>
                            Ocena:{' '}
                            {(profile as Specialist).rating ?? 'Brak ocen'} ·{' '}
                            {(profile as Specialist).verified
                                ? 'Zweryfikowano'
                                : 'Jeszcze nie zweryfikowano'}
                        </p>
                        <Form
                            fields={specialistFields.filter(field => !['title', 'about', 'specialization', 'education', 'servicesSummary'].includes(field.name))}
                            initial={(profile as Specialist).info ?? {}}
                            submit={async (values) => {
                                if (
                                    Array.isArray(values.certificates) &&
                                    (values.certificates.length > 20 ||
                                        values.certificates.some(
                                            (v) => String(v).length > 512,
                                        ))
                                )
                                    throw new Error(
                                        'Do 20 certyfikatów, każdy do 512 znaków.',
                                    )
                                await http.patch('/specialists-info/me', values)
                                await client.invalidateQueries({
                                    queryKey: ['session'],
                                })
                            }}
                        />
                    </section>
                )}
            </div>
        </>
    )
}
