import type { PrivateBucket } from '../files/files.types'

export enum AssetVisibility {
    PRIVATE = 'private',
    OWNER_AND_MANAGERS = 'owner_and_managers',
    MANAGERS = 'managers',
    ADMINS = 'admins',
    ALL_ACCOUNTS = 'all_accounts',
}

export interface PrivateAsset {
    expiresAt: string | null
    fileDeletedAt: string | null
    id: number
    bucket: PrivateBucket
    relPath: string
    originalName: string
    isPopular: boolean
    ownerAccountId: number
    createdByAccountId: number
    visibility: AssetVisibility
    createdAt: string
    updatedAt: string
}

export interface CreatePrivateAssetDto {
    bucket: PrivateBucket
    originalName: string
    ownerAccountId?: number
    visibility?: AssetVisibility
}
