import type { PrivateVariant } from '../../media/private-variants/private-variants.types'
import type { PartnerCompany } from '../partner-companies/partner-companies.types'

export interface PartnerCompanyInfo {
    id: number
    companyId: number
    company?: PartnerCompany | null
    mainPhotoId: number | null
    mainPhoto?: PrivateVariant | null
    websiteUrl: string | null
    shortDescriptionUa: string | null
    shortDescriptionEn: string | null
    shortDescriptionPl: string | null
    shortDescriptionRu: string | null
    descriptionUa: string | null
    descriptionEn: string | null
    descriptionPl: string | null
    descriptionRu: string | null
    instagramUrl: string | null
    facebookUrl: string | null
    tiktokUrl: string | null
    linkedinUrl: string | null
    youtubeUrl: string | null
    telegramUrl: string | null
    createdAt: string
    updatedAt: string
}

export interface UpdatePartnerCompanyInfoDto {
    websiteUrl?: string
    shortDescriptionUa?: string
    shortDescriptionEn?: string
    shortDescriptionPl?: string
    shortDescriptionRu?: string
    descriptionUa?: string
    descriptionEn?: string
    descriptionPl?: string
    descriptionRu?: string
    instagramUrl?: string
    facebookUrl?: string
    tiktokUrl?: string
    linkedinUrl?: string
    youtubeUrl?: string
    telegramUrl?: string
}

export type { PrivateVariant } from '../../media/private-variants/private-variants.types'
