export interface Role {
    id: number
    name: string
}

export interface CreateRoleDto {
    name: string
}

export interface RolesQuery {
    page?: number
    limit?: number
    offset?: number
}
