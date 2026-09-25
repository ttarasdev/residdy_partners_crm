'use client'
import { useEffect, useState } from 'react'
import type { Values } from '../form-data'
import { ImagePreview } from './Media'
import s from './BannerPreview.module.scss'

export default function BannerPreview({
    values,
    file,
    photoId,
}: {
    values: Values
    file?: File
    photoId?: number
}) {
    const [url, setUrl] = useState('')
    useEffect(() => {
        const next =
            file &&
            ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) &&
            file.size <= 20 * 1024 * 1024
                ? URL.createObjectURL(file)
                : ''
        queueMicrotask(() => setUrl(next))
        return () => {
            if (next) URL.revokeObjectURL(next)
        }
    }, [file])
    const big = values.type === 'big'
    return (
        <section className={s.wrapper} aria-label="Podgląd banera">
            <h3>Obraz i podgląd reklamy</h3>
            <p>
                {big
                    ? 'Duży plakat: proporcje 37:50, zalecane 1110 × 1500 px. Zdjęcie wypełnia kartę i może zostać przycięte. Zostaw miejsce na tekst u dołu.'
                    : 'Mały baner: karta 370 × 120. Prześlij osobny obraz bez tekstu, najlepiej PNG z przezroczystym tłem, np. 600 × 600 px. Grafika po prawej dotyka dolnej krawędzi — usuń pusty margines na dole pliku.'}
            </p>
            <p>
                JPEG, PNG lub WebP, do 20 MB. Podgląd w języku polskim; tekst
                wpisz osobno w czterech wersjach językowych.
            </p>
            <div className={`${s.card} ${big ? s.big : s.small}`}>
                <div className={s.image}>
                    {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt="Podgląd wybranego obrazu" />
                    ) : photoId ? (
                        <ImagePreview id={photoId} alt="Obraz banera" />
                    ) : (
                        <span>Twój obraz</span>
                    )}
                </div>
                <div className={s.copy}>
                    <strong>{String(values.titlePl || 'Tytuł reklamy')}</strong>
                    <p>
                        {String(
                            values.subtitlePl || 'Krótki opis Twojej oferty.',
                        )}
                    </p>
                </div>
            </div>
            <small>
                Podgląd orientacyjny. Publikacja nastąpi dopiero po
                zatwierdzeniu przez administratora.
            </small>
        </section>
    )
}
