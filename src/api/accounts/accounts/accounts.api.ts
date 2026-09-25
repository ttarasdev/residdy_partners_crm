import { http } from '../../http'
import type { RequestOptions } from '../../http.types'
import type { Account } from './accounts.types'

export const accountsApi = {
    uploadMyAvatar(file: File, options?: RequestOptions) {
        const data = new FormData()

        data.append('file', file)

        return http.post<Account>('/account/me/avatar', data, options)
    },
}
