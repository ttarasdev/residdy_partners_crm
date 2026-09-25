'use client'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { http } from '@/api/http'
import type { SpecialistInfo } from '@/api/specialists/specialists-info/specialists-info.types'
import { specialistFields } from '../resources'
import Form from './Form'
import s from './portal.module.scss'

const translatedFields = ['title', 'about', 'specialization', 'education', 'servicesSummary']
const languages = [
    { suffix: 'Pl', label: 'PL', name: 'Polski' },
    { suffix: 'Ua', label: 'UA', name: 'Ukraiński' },
    { suffix: 'En', label: 'EN', name: 'Angielski' },
    { suffix: 'Ru', label: 'RU', name: 'Rosyjski' },
] as const

export default function SpecialistTranslations({ info }: { info?: SpecialistInfo | null }) {
    const [language, setLanguage] = useState<string>('Pl')
    const client = useQueryClient()
    return <section className={s.card}>
        <h2>Opis profilu w różnych językach</h2>
        <p className={s.notice}>Wybierz język i uzupełnij informacje widoczne dla klientów. Każdą wersję zapisujesz osobno.</p>
        <div role="tablist" aria-label="Język opisu" style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
            {languages.map(item => <button key={item.suffix} id={`profile-tab-${item.suffix}`} role="tab" type="button" aria-selected={language === item.suffix} aria-controls={`profile-panel-${item.suffix}`} onClick={() => setLanguage(item.suffix)} style={{ padding: '10px 18px', borderRadius: 12, border: '1px solid #bac8d2', background: language === item.suffix ? '#243b4b' : 'transparent', color: language === item.suffix ? '#fff' : 'inherit', cursor: 'pointer' }}>{item.label}</button>)}
        </div>
        {languages.map(item => <div key={item.suffix} id={`profile-panel-${item.suffix}`} role="tabpanel" aria-labelledby={`profile-tab-${item.suffix}`} hidden={language !== item.suffix}>
            <Form
                fields={specialistFields.filter(field => translatedFields.includes(field.name)).map(field => ({ ...field, name: field.name + item.suffix }))}
                initial={info ?? {}}
                label={`Zapisz — ${item.name}`}
                submit={async values => {
                    await http.patch('/specialists-info/me', values)
                    await client.invalidateQueries({ queryKey: ['session'] })
                }}
            />
        </div>)}
    </section>
}
