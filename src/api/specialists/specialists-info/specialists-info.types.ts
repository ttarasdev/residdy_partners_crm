import type { Languages } from '../../common.types'
import type { Specialist } from '../specialists/specialists.types'

export interface SpecialistInfo {
    websiteUrl?: string | null
    instagramUrl?: string | null
    facebookUrl?: string | null
    tiktokUrl?: string | null
    linkedinUrl?: string | null
    youtubeUrl?: string | null
    telegramUrl?: string | null

    titlePl?: string | null
    titleUa?: string | null
    titleEn?: string | null
    titleRu?: string | null
    aboutPl?: string | null
    aboutUa?: string | null
    aboutEn?: string | null
    aboutRu?: string | null
    specializationPl?: string | null
    specializationUa?: string | null
    specializationEn?: string | null
    specializationRu?: string | null
    educationPl?: string | null
    educationUa?: string | null
    educationEn?: string | null
    educationRu?: string | null
    servicesSummaryPl?: string | null
    servicesSummaryUa?: string | null
    servicesSummaryEn?: string | null
    servicesSummaryRu?: string | null

    id: number
    specialistId: number
    specialist?: Specialist | null
    title: string | null
    about: string | null
    languages: Languages[] | null
    specialization: string | null
    experienceYears: number | null
    education: string | null
    certificates: string[] | null
    servicesSummary: string | null
    socialLinks: Record<string, string> | null
    website: string | null
    createdAt: string
    updatedAt: string
}
