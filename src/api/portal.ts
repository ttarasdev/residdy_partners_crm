import { http } from './http'
import type { QueryParams } from './http.types'
import type { Account } from './accounts/accounts/accounts.types'
import type { Partner } from './partners/partners/partners.types'
import type { Specialist } from './specialists/specialists/specialists.types'
export type Role = 'PARTNERS' | 'SPECIALISTS'
export type Profile = Partner | Specialist
export interface Session {
    account: Account
    profile: Profile
    role: Role
}
export interface Page<T> {
    rows: T[]
    total: number
    page: number
    limit: number
    offset: number
}
export function isPortalRole(value: unknown): value is Role {
    return value === 'PARTNERS' || value === 'SPECIALISTS'
}
export class AccessError extends Error {
    constructor() {
        super(
            'Ten panel jest dostępny tylko dla partnerów i specjalistów. W sprawie dostępu skontaktuj się z menedżerem.',
        )
    }
}
export async function fetchSession(
    token: string,
    signal?: AbortSignal,
): Promise<Session> {
    const account = await http.get<Account>('/account/me', { token, signal })
    if (!isPortalRole(account.type)) throw new AccessError()
    if (!Number.isSafeInteger(account.id) || account.status !== 'active')
        throw new AccessError()
    const profile = await http.get<Profile>(
        account.type === 'PARTNERS' ? '/partners/me' : '/specialists/me',
        { token, signal },
    )
    if (!Number.isSafeInteger(profile.id) || profile.accountId !== account.id)
        throw new AccessError()
    return { account, profile, role: account.type }
}
export async function list<T>(
    path: string,
    query: QueryParams = {},
    signal?: AbortSignal,
) {
    const result = await http.get<Page<T>>(path, { query, signal })
    if (
        !result ||
        !Array.isArray(result.rows) ||
        !Number.isFinite(result.total)
    )
        throw new Error('Serwer zwrócił nieprawidłową listę.')
    return result
}
export async function download(path: string, name: string) {
    const blob = await http.getBlob(path)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = name
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
}
