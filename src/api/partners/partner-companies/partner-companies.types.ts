import type { PrivateVariant } from '../../media/private-variants/private-variants.types'
import type { PartnerBanner } from '../partner-banners/partner-banners.types'
import type { PartnerCompanyInfo } from '../partner-company-info/partner-company-info.types'
import type { Partner } from '../partners/partners.types'

export interface PartnerCompany {
    id: number
    partnerId: number
    partner?: Partner | null
    companyName: string
    contactEmail: string | null
    phone: string | null
    logoId: number | null
    logo?: PrivateVariant | null
    status: PartnerCompanyStatus
    info?: PartnerCompanyInfo | null
    banners?: PartnerBanner[]
    createdAt: string
    updatedAt: string
}

export enum PartnerCompanyStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    BLOCKED = 'blocked',
    ARCHIVED = 'archived',
}

export interface PartnerCompaniesQuery {
    page?: number
    limit?: number
    offset?: number
    partnerId?: number
    companyName?: string
    status?: PartnerCompanyStatus
}

export type UpdatePartnerCompanyDto = Partial<CreatePartnerCompanyDto>

export interface CreatePartnerCompanyDto {
    companyName: string
    contactEmail?: string
    phone?: string
}

export interface UpdateCompanyStatusDto {
    status: PartnerCompanyStatus
}

export type { PrivateVariant } from '../../media/private-variants/private-variants.types'
