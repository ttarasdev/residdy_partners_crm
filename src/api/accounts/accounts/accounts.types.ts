import type { AccountType } from '../../common.types'
import type { Manager } from '../../managers/managers/managers.types'
import type { Partner } from '../../partners/partners/partners.types'
import type { Specialist } from '../../specialists/specialists/specialists.types'
import type { User } from '../../users/users/users.types'

export interface Account {
    id: number
    email: string
    avatarId: number | null
    status: AccountStatus
    type: AccountType | null
    archivedAt: string | null
    archivedByAccountId: number | null
    lastLoginAt: string | null
    manager?: Manager | null
    user?: User | null
    specialist?: Specialist | null
    partner?: Partner | null
    createdAt: string
    updatedAt: string
}

export enum AccountStatus {
    ACTIVE = 'active',
    PENDING = 'pending',
    BLOCKED = 'blocked',
    ARCHIVED = 'archived',
}

export interface AccountsQuery {
    type?: AccountType
    id?: number
    email?: string
    status?: AccountStatus
    page?: number
    limit?: number
    offset?: number
}

export type UpdateAccountDto = Partial<
    Omit<CreateAccountDto, 'email' | 'password' | 'type'>
>

export interface CreateAccountDto {
    legalVersionIds?: number[]
    type: AccountType
    email: string
    password: string
    avatarId?: number
    status?: AccountStatus
}
