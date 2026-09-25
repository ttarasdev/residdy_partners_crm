import type { PrivateVariant } from '../../media/private-variants/private-variants.types'
import type { PartnerCompany } from '../partner-companies/partner-companies.types'

export interface PartnerBanner {
    id: number
    companyId: number
    company?: PartnerCompany | null
    photoId: number
    photo?: PrivateVariant | null
    titleUa: string
    titleEn: string
    titlePl: string
    titleRu: string
    subtitleUa: string
    subtitleEn: string
    subtitlePl: string
    subtitleRu: string
    linkUrl: string
    type: PartnerBannerType
    status: PartnerBannerStatus
    startDate: string | null
    endDate: string | null
    viewsCount: number
    clicksCount: number
    maxViews: number | null
    rejectReason: string | null
    createdAt: string
    updatedAt: string
}

export enum PartnerBannerType {
    BIG = 'big',
    SMALL = 'small',
}

export enum PartnerBannerStatus {
    DRAFT = 'draft',
    PENDING_REVIEW = 'pending_review',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    ACTIVE = 'active',
    FINISHED = 'finished',
}

export interface PartnerBannersQuery {
    page?: number
    limit?: number
    offset?: number
    companyId?: number
    type?: PartnerBannerType
    status?: PartnerBannerStatus
}

export interface RejectPartnerBannerDto {
    rejectReason: string
}

export interface ActivatePartnerBannerDto {
    endDate?: string
}
