import type { Role } from '@/api/portal'
import type { Field } from './components/Form'
import { statuses, languages } from './config'
export type ResourceName =
    | 'companies'
    | 'banners'
    | 'consultations'
    | 'schedule'
    | 'bookings'
    | 'reviews'
export interface Resource {
    role: Role
    title: string
    singular: string
    description: string
    list: string
    detail?: string
    create?: string
    edit?: string
    statuses?: string[]
    fields?: Field[]
    columns: {
        key: string
        label: string
        kind?: 'date' | 'status' | 'money'
    }[]
}
export const localized = (
    prefix: string,
    label: string,
    textarea = false,
    required = true,
    maxLength = textarea ? 15000 : 255,
): Field[] =>
    ['Ua', 'Pl', 'En', 'Ru'].map((lang, i) => ({
        name: `${prefix}${lang}`,
        label: `${label} · ${['Ukraiński', 'Polski', 'Angielski', 'Rosyjski'][i]}`,
        type: textarea ? 'textarea' : 'text',
        required,
        maxLength,
    }))
export const contactFields: Field[] = [
    { name: 'name', allowEmpty: true, label: 'Imię', maxLength: 100 },
    { name: 'surname', allowEmpty: true, label: 'Nazwisko', maxLength: 100 },
    {
        name: 'phone',
        label: 'Telefon',
        type: 'tel',
        pattern: '\\+?[1-9][0-9]{7,14}',
        hint: 'Format międzynarodowy, np. +48123456789',
    },
    {
        name: 'location',
        allowEmpty: true,
        label: 'Miasto / lokalizacja',
        maxLength: 255,
    },
]
export const companyFields: Field[] = [
    {
        name: 'companyName',
        label: 'Nazwa firmy',
        required: true,
        maxLength: 255,
    },
    {
        name: 'contactEmail',
        label: 'E-mail kontaktowy',
        type: 'email',
        maxLength: 254,
    },
    {
        name: 'phone',
        label: 'Telefon',
        type: 'tel',
        pattern: '\\+?[1-9][0-9]{7,14}',
    },
]
export const infoFields: Field[] = [
    {
        name: 'websiteUrl',
        label: 'Strona internetowa',
        type: 'url',
        maxLength: 2048,
    },
    ...localized('shortDescription', 'Krótki opis', true, false, 500),
    ...localized('description', 'Pełny opis', true, false),
    ...[
        'instagram',
        'facebook',
        'tiktok',
        'linkedin',
        'youtube',
        'telegram',
    ].map((name) => ({
        name: `${name}Url`,
        label: name[0].toUpperCase() + name.slice(1),
        type: 'url' as const,
        maxLength: 2048,
    })),
]
export const specialistFields: Field[] = [
    {
        name: 'title',
        allowEmpty: true,
        label: 'Tytuł zawodowy',
        maxLength: 255,
    },
    {
        name: 'specialization',
        allowEmpty: true,
        label: 'Specjalizacja',
        maxLength: 255,
    },
    {
        name: 'experienceYears',
        label: 'Doświadczenie (lata)',
        type: 'number',
        min: 0,
        max: 100,
        step: 1,
    },
    {
        name: 'languages',
        label: 'Języki komunikacji',
        type: 'multi',
        options: languages,
    },
    {
        name: 'about',
        allowEmpty: true,
        label: 'O mnie',
        type: 'textarea',
        maxLength: 15000,
    },
    {
        name: 'education',
        allowEmpty: true,
        label: 'Wykształcenie',
        type: 'textarea',
        maxLength: 15000,
    },
    {
        name: 'servicesSummary',
        allowEmpty: true,
        label: 'W czym mogę pomóc',
        type: 'textarea',
        maxLength: 15000,
    },
    {
        name: 'certificates',
        allowEmpty: true,
        label: 'Certyfikaty',
        type: 'lines',
        hint: 'Do 20 wpisów, każdy w osobnym wierszu.',
    },
    { name: 'websiteUrl', label: 'Strona internetowa', type: 'url', maxLength: 2048, allowEmpty: true },
    { name: 'instagramUrl', label: 'Instagram', type: 'url', maxLength: 2048, allowEmpty: true },
    { name: 'facebookUrl', label: 'Facebook', type: 'url', maxLength: 2048, allowEmpty: true },
    { name: 'tiktokUrl', label: 'TikTok', type: 'url', maxLength: 2048, allowEmpty: true },
    { name: 'linkedinUrl', label: 'LinkedIn', type: 'url', maxLength: 2048, allowEmpty: true },
    { name: 'youtubeUrl', label: 'YouTube', type: 'url', maxLength: 2048, allowEmpty: true },
    { name: 'telegramUrl', label: 'Telegram', type: 'url', maxLength: 2048, allowEmpty: true },
]
export const resources: Record<ResourceName, Resource> = {
    companies: {
        role: 'PARTNERS',
        title: 'Moje firmy',
        singular: 'Firma',
        description: 'Zarządzaj firmami i ich stronami w Residdy.',
        list: '/partner-companies/my',
        detail: '/partner-companies/my',
        statuses: ['draft', 'active', 'blocked', 'archived'],
        fields: companyFields,
        columns: [
            { key: 'companyName', label: 'Firma' },
            { key: 'contactEmail', label: 'E-mail kontaktowy' },
            { key: 'phone', label: 'Telefon' },
            { key: 'status', label: 'Status', kind: 'status' },
        ],
    },
    banners: {
        role: 'PARTNERS',
        title: 'Banery reklamowe',
        singular: 'Baner',
        description: 'Twórz reklamy i śledź wyniki kampanii.',
        list: '/partner-banners/my',
        detail: '/partner-banners/my',
        create: '/partner-banners/my',
        edit: '/partner-banners/my',
        statuses: [
            'pending_review',
            'approved',
            'rejected',
            'active',
            'finished',
            'draft',
        ],
        fields: [
            {
                name: 'companyId',
                label: 'Firma',
                type: 'select',
                numeric: true,
                min: 1,
                required: true,
            },
            {
                name: 'type',
                label: 'Format',
                type: 'select',
                required: true,
                options: [
                    { value: 'big', label: 'Duży baner' },
                    { value: 'small', label: 'Mały baner' },
                ],
            },
            ...localized('title', 'Tytuł'),
            ...localized('subtitle', 'Podtytuł'),
            {
                name: 'linkUrl',
                label: 'Link',
                type: 'url',
                required: true,
                maxLength: 2048,
            },
            {
                name: 'maxViews',
                label: 'Limit wyświetleń',
                type: 'number',
                min: 1,
                max: 2147483647,
                step: 1,
            },
        ],
        columns: [
            { key: 'titlePl', label: 'Baner' },
            { key: 'company.companyName', label: 'Firma' },
            { key: 'status', label: 'Status', kind: 'status' },
            { key: 'viewsCount', label: 'Wyświetlenia' },
            { key: 'clicksCount', label: 'Kliknięcia' },
        ],
    },
    consultations: {
        role: 'SPECIALISTS',
        title: 'Moje konsultacje',
        singular: 'Konsultacja',
        description: 'Twoje usługi, języki konsultacji, czas trwania i ceny.',
        list: '/specialist-consultations/my',
        detail: '/specialist-consultations',
        create: '/specialist-consultations',
        edit: '/specialist-consultations',
        statuses: ['draft', 'active', 'inactive', 'archived'],
        fields: [
            {
                name: 'consultationCategoryId',
                label: 'Kategoria',
                type: 'select',
                numeric: true,
                min: 1,
                required: true,
            },
            {
                name: 'durationMinutes',
                label: 'Czas trwania (minuty)',
                type: 'number',
                required: true,
                min: 5,
                max: 60,
                step: 1,
            },
            {
                name: 'price',
                label: 'Cena (PLN)',
                type: 'number',
                required: true,
                min: 0,
                max: 99999999.99,
                step: 0.01,
            },
            {
                name: 'status',
                label: 'Status',
                type: 'select',
                options: ['draft', 'active', 'inactive', 'archived'].map(
                    (v) => ({ value: v, label: statuses[v] }),
                ),
            },
            {
                name: 'lans',
                label: 'Języki konsultacji',
                type: 'multi',
                required: true,
                options: languages,
            },
            ...localized('title', 'Nazwa'),
            ...localized('description', 'Opis', true),
        ],
        columns: [
            { key: 'titlePl', label: 'Konsultacja' },
            { key: 'durationMinutes', label: 'Minuty' },
            { key: 'price', label: 'Cena (PLN)', kind: 'money' },
            { key: 'status', label: 'Status', kind: 'status' },
        ],
    },
    schedule: {
        role: 'SPECIALISTS',
        title: 'Mój harmonogram',
        singular: 'Termin konsultacji',
        description:
            'Planuj dostępne terminy. Daty i godziny podawane są w strefie Europe/Warsaw.',
        list: '/consultation-slots/my',
        detail: '/consultation-slots/my',
        create: '/consultation-slots',
        edit: '/consultation-slots',
        fields: [
            {
                name: 'specialistConsultationId',
                label: 'Konsultacja',
                type: 'select',
                numeric: true,
                min: 1,
                required: true,
            },
            {
                name: 'startsAt',
                label: 'Początek · czas warszawski',
                type: 'datetime-local',
                required: true,
            },
        ],
        columns: [
            { key: 'specialistConsultation.titlePl', label: 'Konsultacja' },
            { key: 'startsAt', label: 'Początek', kind: 'date' },
            { key: 'endsAt', label: 'Zakończenie', kind: 'date' },
            { key: 'status', label: 'Status', kind: 'status' },
        ],
    },
    bookings: {
        role: 'SPECIALISTS',
        title: 'Rezerwacje',
        singular: 'Rezerwacje',
        description:
            'Informacje o spotkaniach, zgłoszeniach klientów i materiałach.',
        list: '/consultation-bookings/specialist/my',
        detail: '/consultation-bookings/specialist/my',
        statuses: [
            'awaiting_payment',
            'paid',
            'canceled',
            'completed',
            'no_show',
            'refunded',
        ],
        columns: [
            { key: 'specialistConsultation.titlePl', label: 'Konsultacja' },
            { key: 'user.name', label: 'Klient' },
            { key: 'startsAt', label: 'Data i godzina', kind: 'date' },
            { key: 'status', label: 'Status', kind: 'status' },
            { key: 'price', label: 'Kwota', kind: 'money' },
        ],
    },
    reviews: {
        role: 'SPECIALISTS',
        title: 'Opinie',
        singular: 'Opinia',
        description: 'Opublikowane opinie klientów o Twojej pracy.',
        list: '/consultation-reviews/specialist',
        columns: [
            { key: 'user.name', label: 'Klient' },
            { key: 'rating', label: 'Ocena / 5' },
            { key: 'comment', label: 'Opinia' },
            { key: 'createdAt', label: 'Data', kind: 'date' },
        ],
    },
}
export function isResource(value: string): value is ResourceName {
    return Object.hasOwn(resources, value)
}
export function valueAt(record: object, key: string): unknown {
    return key
        .split('.')
        .reduce<unknown>(
            (obj, part) =>
                obj && typeof obj === 'object'
                    ? (obj as Record<string, unknown>)[part]
                    : undefined,
            record,
        )
}
