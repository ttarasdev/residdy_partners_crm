import type { Role } from '@/api/portal'
export const navigation = {
    PARTNERS: [
        {
            slug: 'companies',
            label: 'Moje firmy',
            description: 'Firmy, kontakty i strony publiczne',
            icon: 'company',
        },
        {
            slug: 'banners',
            label: 'Banery reklamowe',
            description: 'Kampanie, moderacja i wyniki',
            icon: 'banner',
        },
    ],
    SPECIALISTS: [
        {
            slug: 'bookings',
            label: 'Rezerwacje',
            description: 'Klienci i zaplanowane spotkania',
            icon: 'booking',
        },
        {
            slug: 'schedule',
            label: 'Mój harmonogram',
            description: 'Dostępne terminy konsultacji',
            icon: 'calendar',
        },
        {
            slug: 'consultations',
            label: 'Moje konsultacje',
            description: 'Usługi, czas trwania i ceny',
            icon: 'consultation',
        },
        {
            slug: 'reviews',
            label: 'Opinie',
            description: 'Opublikowane opinie klientów',
            icon: 'review',
        },
    ],
} as const
export const roleLabel = {
    PARTNERS: 'Panel partnera',
    SPECIALISTS: 'Panel specjalisty',
}
export function canAccess(role: Role, section: string) {
    return (
        ['overview', 'profile', 'security'].includes(section) ||
        navigation[role].some((item) => item.slug === section)
    )
}
export const statuses: Record<string, string> = {
    active: 'Aktywny',
    draft: 'Szkic',
    inactive: 'Nieaktywny',
    archived: 'Zarchiwizowano',
    blocked: 'Zablokowano',
    pending_review: 'W moderacji',
    approved: 'Zatwierdzono',
    rejected: 'Odrzucono',
    finished: 'Zakończono',
    open: 'Wolny',
    held: 'Oczekuje na płatność',
    booked: 'Zarezerwowano',
    canceled: 'Anulowano',
    awaiting_payment: 'Oczekuje na płatność',
    paid: 'Opłacono',
    completed: 'Zakończono',
    no_show: 'Nieobecność',
    refunded: 'Zwrócono środki',
    published: 'Opublikowano',
    ready: 'Gotowe',
    pending: 'Oczekiwanie',
    failed: 'Błąd',
    succeeded: 'Zakończono pomyślnie',
    none: 'Brak',
}
export const languages = [
    { value: 'UA', label: 'Ukraiński' },
    { value: 'PL', label: 'Polski' },
    { value: 'EN', label: 'Angielski' },
    { value: 'RU', label: 'Rosyjski' },
]
