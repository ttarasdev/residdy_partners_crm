import type {
    Account,
    AccountStatus,
    CreateAccountDto,
} from '../../accounts/accounts/accounts.types'
import type { PartnerCompany } from '../partner-companies/partner-companies.types'

export interface Partner {
    id: number
    accountId: number
    account?: Account | null
    name: string | null
    surname: string | null
    location: string | null
    phone: string | null
    companies?: PartnerCompany[]
    createdAt: string
    updatedAt: string
}

export type RegisterPartnerDto = Pick<CreateAccountDto, 'email' | 'password'> &
    UpdatePartnerDto

export interface UpdatePartnerDto {
    name?: string
    surname?: string
    location?: string
    phone?: string
}

export interface PartnersQuery {
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

export interface UpdatePartnerStatusDto {
    status: AccountStatus
}
