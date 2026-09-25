export type RequestEmailChangeDto = RequestPasswordChangeDto & {
    newEmail: string
}

export interface RequestPasswordChangeDto {
    currentPassword: string
}

export type ConfirmEmailChangeDto = RequestEmailChangeDto & {
    code: string
}

export type ConfirmEmailDto = ForgotPasswordDto & {
    code: string
}

export interface ForgotPasswordDto {
    email: string
}

export type ChangePasswordDto = RequestPasswordChangeDto & {
    code: string
    password: string
}

export type LoginAccountDto = ForgotPasswordDto & {
    password: string
}

export type ResetPasswordDto = ForgotPasswordDto & {
    code: string
    password: string
}

export interface LoginResponse {
    token: string
}
