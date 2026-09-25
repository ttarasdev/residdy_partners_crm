'use client'
import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/api/http'
import { accountsApi } from '@/api/accounts/accounts/accounts.api'
import type { PrivateVariant } from '@/api/media/private-variants/private-variants.types'
import { useAuth } from '@/shared/hooks/useAuth'
import { ErrorBox } from '@/components/ui/Common'
import Form from './Form'
import s from './portal.module.scss'
export function ImagePreview({ id, alt }: { id: number; alt: string }) {
    const { session } = useAuth()
    const [url, setUrl] = useState('')
    const query = useQuery({
        queryKey: ['portal', session!.account.id, 'image', id],
        queryFn: async ({ signal }) => {
            const variant = await http.get<PrivateVariant>(
                `/private-variants/${id}`,
                { signal },
            )
            const blob = await http.getBlob(
                `/private-assets/${variant.mediumAssetId}/file`,
                { signal },
            )
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(blob.type))
                throw new Error('Nieobsługiwany format obrazu.')
            return blob
        },
    })
    useEffect(() => {
        if (!query.data) return
        const next = URL.createObjectURL(query.data)
        queueMicrotask(() => setUrl(next))
        return () => URL.revokeObjectURL(next)
    }, [query.data])
    if (query.error) return <ErrorBox error={query.error} />
    // Protected assets require a bearer header; a local object URL avoids exposing tokens.
    return url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={alt} className={s.preview} />
    ) : (
        <p className={s.muted}>Ładowanie obrazu…</p>
    )
}
export default function Media({
    path,
    id,
    title,
    editable = true,
}: {
    path: string
    id?: number | null
    title: string
    editable?: boolean
}) {
    const client = useQueryClient()
    return (
        <section className={s.card}>
            <h2>{title}</h2>
            <div className={s.stack}>
                {id ? (
                    <ImagePreview id={id} alt={title} />
                ) : (
                    <p className={s.muted}>Nie dodano jeszcze obrazu.</p>
                )}
                {editable && (
                    <Form
                        fields={[]}
                        file="required"
                        label="Prześlij obraz"
                        submit={async (_, file) => {
                            const data = new FormData()
                            data.append('file', file!)
                            if (path === '/account/me/avatar')
                                await accountsApi.uploadMyAvatar(file!)
                            else await http.post(path, data)
                            await client.invalidateQueries({
                                queryKey: ['portal'],
                            })
                            await client.invalidateQueries({
                                queryKey: ['session'],
                            })
                        }}
                    />
                )}
            </div>
        </section>
    )
}
