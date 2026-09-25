import type { PrivateBucket } from '../files/files.types'
import type {
    AssetVisibility,
    CreatePrivateAssetDto,
    PrivateAsset,
} from '../private-assets/private-assets.types'

export interface PrivateVariant {
    id: number
    bucket: PrivateBucket
    originalName: string
    ownerAccountId: number
    createdByAccountId: number
    visibility: AssetVisibility
    isPopular: boolean
    smallAssetId: number
    smallAsset?: PrivateAsset | null
    mediumAssetId: number
    mediumAsset?: PrivateAsset | null
    largeAssetId: number
    largeAsset?: PrivateAsset | null
    createdAt: string
    updatedAt: string
}

export type CreatePrivateVariantDto = CreatePrivateAssetDto
