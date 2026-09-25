import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { ApiError } from '@/api/api-error'
import { clearAccessToken } from '@/api/auth-token'
export function createQueryClient() {
    const onError = (error: Error) => {
        if (
            error instanceof ApiError &&
            error.status === 401 &&
            !error.url.includes('/account-auth/')
        )
            clearAccessToken()
    }
    return new QueryClient({
        queryCache: new QueryCache({ onError }),
        mutationCache: new MutationCache({ onError }),
        defaultOptions: { queries: { retry: false, staleTime: 30000 } },
    })
}
