import { warsawToISO } from './time'
export interface Field {
    name: string
    label: string
    type?:
        | 'text'
        | 'textarea'
        | 'email'
        | 'tel'
        | 'url'
        | 'password'
        | 'number'
        | 'datetime-local'
        | 'select'
        | 'multi'
        | 'lines'
        | 'links'
    required?: boolean
    numeric?: boolean
    allowEmpty?: boolean
    min?: number
    max?: number
    step?: number
    maxLength?: number
    options?: { value: string; label: string }[]
    hint?: string
    pattern?: string
}
export type Values = Record<string, unknown>
export function serialize(fields: Field[], form: FormData): Values {
    const result: Values = {}
    for (const f of fields) {
        if (f.type === 'multi') {
            const values = form.getAll(f.name).map(String)
            if (f.required && !values.length)
                throw new Error(`Wybierz: ${f.label}`)
            result[f.name] = values
            continue
        }
        const raw = String(form.get(f.name) ?? '')
        const value = f.type === 'password' ? raw : raw.trim()
        if (!value) {
            if (f.required) throw new Error(`Uzupełnij: ${f.label}`)
            if (f.allowEmpty)
                result[f.name] =
                    f.type === 'lines' ? [] : f.type === 'links' ? {} : ''
            continue
        }
        if (f.type === 'number' || f.numeric) {
            const n = Number(value)
            if (
                !Number.isFinite(n) ||
                (f.min !== undefined && n < f.min) ||
                (f.max !== undefined && n > f.max) ||
                ((f.step === 1 || f.numeric) && !Number.isInteger(n))
            )
                throw new Error(`Sprawdź pole: ${f.label}`)
            result[f.name] = n
        } else if (f.type === 'datetime-local')
            result[f.name] = warsawToISO(value)
        else if (f.type === 'lines')
            result[f.name] = value
                .split('\n')
                .map((x) => x.trim())
                .filter(Boolean)
        else if (f.type === 'links') {
            const pairs = value.split('\n').map((line) => {
                const i = line.indexOf('=')
                if (i < 1) throw new Error('Format linków: nazwa=https://adres')
                const name = line.slice(0, i).trim()
                const url = line.slice(i + 1).trim()
                if (!/^https?:\/\//i.test(url))
                    throw new Error(
                        'Link musi zaczynać się od https:// lub http://',
                    )
                return [name, url]
            })
            result[f.name] = Object.fromEntries(pairs)
        } else {
            if (f.type === 'url' && !/^https?:\/\//i.test(value))
                throw new Error(`Podaj http:// lub https://: ${f.label}`)
            result[f.name] = value
        }
    }
    return result
}

/** PATCH only changed fields: unchanged inactive categories must not be revalidated. */
export function changedValues(
    fields: Field[],
    values: Values,
    initial: Values,
): Values {
    return Object.fromEntries(
        Object.entries(values).filter(([key, value]) => {
            const field = fields.find((f) => f.name === key)
            const before = initial[key]
            if (field?.type === 'number' || field?.numeric)
                return before == null || Number(before) !== value
            if (field?.type === 'datetime-local')
                return (
                    new Date(String(before)).getTime() !==
                    new Date(String(value)).getTime()
                )
            if (Array.isArray(value))
                return JSON.stringify(before ?? []) !== JSON.stringify(value)
            if (typeof value === 'object' && value !== null)
                return JSON.stringify(before ?? {}) !== JSON.stringify(value)
            return (before ?? '') !== value
        }),
    )
}
