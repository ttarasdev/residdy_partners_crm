import type {
    Account,
    AccountStatus,
    CreateAccountDto,
} from '../../accounts/accounts/accounts.types'
import type { SpecialistInfo } from '../specialists-info/specialists-info.types'

export interface Specialist {
    id: number
    accountId: number
    account?: Account | null
    name: string | null
    surname: string | null
    location: string | null
    phone: string | null
    rating: string | null
    verified: boolean
    info?: SpecialistInfo | null
    createdAt: string
    updatedAt: string
}

export type RegisterSpecialistDto = Pick<
    CreateAccountDto,
    'email' | 'password'
> &
    UpdateSpecialistDto

export interface UpdateSpecialistDto {
    name?: string
    surname?: string
    location?: string
    phone?: string
}

export interface SpecialistsQuery {
    page?: number
    limit?: number
    offset?: number
    id?: number
    email?: string
    name?: string
    surname?: string
    phone?: string
    location?: string
    status?: AccountStatus
}

export type ManageSpecialistDto = UpdateSpecialistDto & {
    verified?: boolean
}

export interface UpdateSpecialistStatusDto {
    status: AccountStatus
}

export type SpecialistProfile = Pick<
    Specialist,
    'id' | 'name' | 'surname' | 'location' | 'verified' | 'rating'
> & {
    account: Pick<Account, 'avatarId'>
    info: Omit<
        SpecialistInfo,
        'id' | 'specialistId' | 'createdAt' | 'updatedAt'
    > | null
}
