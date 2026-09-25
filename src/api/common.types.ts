export enum AccountType {
    USERS = 'USERS',
    MANAGERS = 'MANAGERS',
    PARTNERS = 'PARTNERS',
    SPECIALISTS = 'SPECIALISTS',
}

export enum Languages {
    UA = 'UA',
    PL = 'PL',
    EN = 'EN',
    RU = 'RU',
}

/** JSON dates remain strings; monetary DECIMAL fields also remain strings. */
export interface PageResponse<T> {
    rows: T[]
    total: number
    page: number
    limit: number
    offset: number
}

export interface SuccessResponse {
    success: true
}

export interface OkResponse {
    ok: true
}

export interface TogglePopularResponse extends SuccessResponse {
    isPopular: boolean
}

export interface SignedUrlResponse {
    /** Private signed URLs still require the Authorization header. */
    url: string
}

export interface PlannerTickResult {
    processed: number
}
