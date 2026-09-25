import { test } from 'node:test'
import assert from 'node:assert/strict'
import { accountsApi } from '../src/api/accounts/accounts/accounts.api'

test('partner and specialist avatars use the authenticated account endpoint', async () => {
    const original = globalThis.fetch

    try {
        globalThis.fetch = async (url, init) => {
            assert.equal(
                String(url),
                'https://api.example.test/account/me/avatar',
            )
            assert.equal(init?.method, 'POST')
            assert.equal(
                new Headers(init?.headers).get('authorization'),
                'Bearer token',
            )
            assert.equal(new Headers(init?.headers).has('content-type'), false)
            assert(init?.body instanceof FormData)
            assert.deepEqual([...init.body.keys()], ['file'])
            return Response.json({ id: 3, avatarId: 8 })
        }

        const result = await accountsApi.uploadMyAvatar(
            new File(['image'], 'avatar.png'),
            { baseUrl: 'https://api.example.test', token: 'token' },
        )

        assert.equal(result.avatarId, 8)
    } finally {
        globalThis.fetch = original
    }
})
