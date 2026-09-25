import type {
    Account,
    AccountStatus,
    CreateAccountDto,
} from '../../accounts/accounts/accounts.types'
import type { Role } from '../roles/roles.types'

export interface Manager {
    id: number
    accountId: number
    account?: Account | null
    name: string | null
    surname: string | null
    phone: string | null
    location: string | null
    position: string | null
    theme: ManagerTheme
    roles?: Role[]
    createdAt: string
    updatedAt: string
}

export enum ManagerTheme {
    WHITE = 'white',
    BLACK = 'black',
}

export type RegisterManagerDto = Pick<CreateAccountDto, 'email' | 'password'>

export interface UpdateManagerDto {
    name?: string
    surname?: string
    phone?: string
    location?: string
    position?: string
    theme?: ManagerTheme
}

export interface ManagersQuery {
    page?: number
    limit?: number
    offset?: number
    status?: AccountStatus
    email?: string
}

export interface UpdateManagerRolesDto {
    roleIds: number[]
}
