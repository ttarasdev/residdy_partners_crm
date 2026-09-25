import type {
    Account,
    AccountStatus,
} from '../../accounts/accounts/accounts.types'
import type { Languages } from '../../common.types'

export interface User {
    id: number
    accountId: number
    account?: Account | null
    parentId: number | null
    parent?: User | null
    name: string | null
    surname: string | null
    phone: string | null
    location: string | null
    lan: Languages
    level: number
    profileCompletedAt: string | null
    createdAt: string
    updatedAt: string
}

export interface UsersQuery {
    page?: number
    limit?: number
    offset?: number
    id?: number
    parentId?: number
    level?: number
    email?: string
    name?: string
    surname?: string
    phone?: string
    location?: string
    lan?: Languages
    status?: AccountStatus
}

export type UpdateUserDto = UpdateMeDto & {
    level?: number
    parentId?: number
}

export interface UpdateMeDto {
    name?: string
    surname?: string
    phone?: string
    location?: string
    lan?: Languages
}

export interface UpdateUserStatusDto {
    status: AccountStatus
}
