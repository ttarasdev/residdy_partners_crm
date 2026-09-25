export const TIME_ZONE = 'Europe/Warsaw'
export function dayKey(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date)
}
export function addDays(day: string, count: number) {
    const d = new Date(day + 'T12:00:00Z')
    d.setUTCDate(d.getUTCDate() + count)
    return d.toISOString().slice(0, 10)
}
export function monday() {
    const today = dayKey()
    const d = new Date(today + 'T12:00:00Z').getUTCDay()
    return addDays(today, -(d === 0 ? 6 : d - 1))
}
export function dateTime(value: string | null | undefined) {
    if (!value) return '—'
    return new Intl.DateTimeFormat('pl-PL', {
        timeZone: TIME_ZONE,
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}
export function warsawInput(iso: string) {
    const parts = new Intl.DateTimeFormat('sv-SE', {
        timeZone: TIME_ZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
    }).format(new Date(iso))
    return parts.replace(' ', 'T')
}
/** Reject nonexistent/ambiguous DST times instead of silently shifting an appointment. */
export function warsawToISO(input: string) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input))
        throw new Error('Podaj datę i godzinę.')
    const wall = Date.parse(input + ':00Z')
    const candidates = [1, 2]
        .map((offset) => new Date(wall - offset * 3600000))
        .filter(
            (date) =>
                !Number.isNaN(date.getTime()) &&
                warsawInput(date.toISOString()) === input,
        )
    if (candidates.length !== 1)
        throw new Error(
            'Ta godzina nie istnieje lub jest niejednoznaczna z powodu zmiany czasu w Warszawie. Wybierz inną godzinę.',
        )
    return candidates[0].toISOString()
}
