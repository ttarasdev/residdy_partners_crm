import type { OkResponse } from '../../common.types'
import type { RequestOptions } from '../../http.types'
import type {
    ChangePasswordDto,
    ConfirmEmailChangeDto,
    ConfirmEmailDto,
    ForgotPasswordDto,
    LoginAccountDto,
    LoginResponse,
    RequestEmailChangeDto,
    RequestPasswordChangeDto,
    ResetPasswordDto,
} from './account-auth.types'
import { http } from '../../http'

const BASE = '/account-auth'

export const accountAuthApi = {
    /** POST /account-auth/request-email-change */
    requestEmailChange: (
        dto: RequestEmailChangeDto,
        options?: RequestOptions,
    ) =>
        http.post<OkResponse>(`${BASE}/request-email-change`, dto, {
            ...options,
        }),

    /** POST /account-auth/confirm-email-change */
    confirmEmailChange: (
        dto: ConfirmEmailChangeDto,
        options?: RequestOptions,
    ) =>
        http.post<OkResponse>(`${BASE}/confirm-email-change`, dto, {
            ...options,
        }),

    /** POST /account-auth/confirm */
    confirm: (dto: ConfirmEmailDto, options?: RequestOptions) =>
        http.post<OkResponse>(`${BASE}/confirm`, dto, {
            ...options,
            auth: false,
        }),

    /** POST /account-auth/resend */
    resend: (dto: ForgotPasswordDto, options?: RequestOptions) =>
        http.post<OkResponse>(`${BASE}/resend`, dto, {
            ...options,
            auth: false,
        }),

    /** POST /account-auth/request-password-change */
    requestPasswordChange: (
        dto: RequestPasswordChangeDto,
        options?: RequestOptions,
    ) =>
        http.post<OkResponse>(`${BASE}/request-password-change`, dto, {
            ...options,
        }),

    /** POST /account-auth/change-password */
    changePassword: (dto: ChangePasswordDto, options?: RequestOptions) =>
        http.post<OkResponse>(`${BASE}/change-password`, dto, { ...options }),

    /** POST /account-auth/login */
    login: (dto: LoginAccountDto, options?: RequestOptions) =>
        http.post<LoginResponse>(`${BASE}/login`, dto, {
            ...options,
            auth: false,
        }),

    /** POST /account-auth/forgot-password */
    forgotPassword: (dto: ForgotPasswordDto, options?: RequestOptions) =>
        http.post<OkResponse>(`${BASE}/forgot-password`, dto, {
            ...options,
            auth: false,
        }),

    /** POST /account-auth/reset-password */
    resetPassword: (dto: ResetPasswordDto, options?: RequestOptions) =>
        http.post<OkResponse>(`${BASE}/reset-password`, dto, {
            ...options,
            auth: false,
        }),
}
