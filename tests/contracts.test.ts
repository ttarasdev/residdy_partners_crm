import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    fetchSession,
    isPortalRole,
    AccessError,
    list,
} from '../src/api/portal'
import { http } from '../src/api/http'
import { ApiError, ApiResponseError } from '../src/api/api-error'
import { canAccess } from '../src/features/portal/config'
import { warsawToISO, warsawInput, addDays } from '../src/features/portal/time'
import { serialize } from '../src/features/portal/form-data'
process.env.NEXT_PUBLIC_API_URL = 'https://api.example.test'
const originalFetch = globalThis.fetch
function mock(
    handler: (url: string, init?: RequestInit) => Response | Promise<Response>,
) {
    globalThis.fetch = ((url: string | URL | Request, init?: RequestInit) =>
        Promise.resolve(handler(String(url), init))) as typeof fetch
}
test.afterEach(() => {
    globalThis.fetch = originalFetch
})
test('server account role selects only its own profile endpoint', async () => {
    for (const [role, endpoint] of [
        ['PARTNERS', '/partners/me'],
        ['SPECIALISTS', '/specialists/me'],
    ]) {
        const seen: string[] = []
        mock((url, init) => {
            seen.push(new URL(url).pathname)
            assert.equal(
                new Headers(init?.headers).get('authorization'),
                'Bearer valid',
            )
            return Response.json(
                url.endsWith('/account/me')
                    ? { id: 1, type: role, status: 'active' }
                    : { id: 2, accountId: 1 },
            )
        })
        const session = await fetchSession('valid')
        assert.equal(session.role, role)
        assert.deepEqual(seen, ['/account/me', endpoint])
    }
})
test('manager, user, inactive accounts and mismatched profile cannot access portal', async () => {
    for (const type of ['MANAGERS', 'USERS', null, 'partner']) {
        mock(() => Response.json({ id: 1, status: 'active', type }))
        await assert.rejects(fetchSession('x'), AccessError)
    }
    mock(() => Response.json({ id: 1, status: 'blocked', type: 'PARTNERS' }))
    await assert.rejects(fetchSession('x'), AccessError)
    mock((url) =>
        Response.json(
            url.endsWith('/account/me')
                ? { id: 1, status: 'active', type: 'SPECIALISTS' }
                : { id: 2, accountId: 9 },
        ),
    )
    await assert.rejects(fetchSession('x'), AccessError)
})
test('role access also denies manually entered routes', () => {
    assert.ok(isPortalRole('PARTNERS'))
    assert.ok(canAccess('PARTNERS', 'companies'))
    assert.ok(canAccess('SPECIALISTS', 'bookings'))
    assert.ok(canAccess('PARTNERS', 'security'))
    for (const route of ['bookings', 'schedule', 'consultations', 'reviews'])
        assert.equal(canAccess('PARTNERS', route), false)
    for (const route of ['companies', 'banners', '../companies', 'managers'])
        assert.equal(canAccess('SPECIALISTS', route), false)
})
test('Warsaw conversion handles winter, summer and rejects DST ambiguity/gaps', () => {
    assert.equal(warsawToISO('2026-01-20T10:30'), '2026-01-20T09:30:00.000Z')
    assert.equal(warsawToISO('2026-07-20T10:30'), '2026-07-20T08:30:00.000Z')
    assert.equal(warsawInput('2026-07-20T08:30:00.000Z'), '2026-07-20T10:30')
    assert.throws(() => warsawToISO('2026-03-29T02:30'))
    assert.throws(() => warsawToISO('2026-10-25T02:30'))
    assert.throws(() => warsawToISO('2026-02-30T10:00'))
    assert.equal(addDays('2026-12-28', 7), '2027-01-04')
})
test('forms preserve passwords and produce typed numeric and language DTOs', () => {
    const data = new FormData()
    data.set('price', '120.50')
    data.set('password', ' spaces matter ')
    data.append('lans', 'UA')
    data.append('lans', 'PL')
    assert.deepEqual(
        serialize(
            [
                { name: 'price', label: 'Ціна', type: 'number', min: 0 },
                { name: 'password', label: 'Пароль', type: 'password' },
                { name: 'lans', label: 'Мови', type: 'multi', required: true },
            ],
            data,
        ),
        { price: 120.5, password: ' spaces matter ', lans: ['UA', 'PL'] },
    )
    data.set('price', '-1')
    assert.throws(() =>
        serialize(
            [{ name: 'price', label: 'Ціна', type: 'number', min: 0 }],
            data,
        ),
    )
    assert.throws(() =>
        serialize(
            [{ name: 'lans', label: 'Мови', type: 'multi', required: true }],
            new FormData(),
        ),
    )
})
test('transport keeps multipart boundary, bearer header, query and cancellation signal', async () => {
    const body = new FormData()
    body.set('file', new Blob(['image'], { type: 'image/png' }), 'image.png')
    const abort = new AbortController()
    mock((url, init) => {
        assert.equal(new URL(url).searchParams.get('weekStart'), '2026-09-07')
        assert.equal(init?.signal, abort.signal)
        assert.equal(init?.body, body)
        const headers = new Headers(init?.headers)
        assert.equal(headers.get('content-type'), null)
        assert.equal(headers.get('authorization'), 'Bearer t')
        return Response.json({ id: 1 })
    })
    await http.post('/partner-banners/my', body, {
        token: 't',
        signal: abort.signal,
        query: { weekStart: '2026-09-07' },
    })
})
test('public login never sends bearer tokens and HTTP errors retain status', async () => {
    mock((_url, init) => {
        assert.equal(new Headers(init?.headers).get('authorization'), null)
        return Response.json(
            { message: 'Invalid credentials' },
            { status: 401 },
        )
    })
    await assert.rejects(
        http.post(
            '/account-auth/login',
            {},
            { auth: false, token: 'should-not-send' },
        ),
        (e: unknown) => e instanceof ApiError && e.status === 401,
    )
})
test('malformed success and invalid page data are rejected', async () => {
    mock(() => new Response('<html>proxy</html>'))
    await assert.rejects(http.get('/account/me'), ApiResponseError)
    mock(() => Response.json({ rows: [], count: 0 }))
    await assert.rejects(list('/partner-companies/my'))
})
test('transport accepts legitimate empty 204 responses', async () => {
    mock(() => new Response(null, { status: 204 }))
    assert.equal(await http.delete('/consultation-slots/2'), undefined)
})

test('PATCH omits unchanged categories, decimal prices and equivalent dates', async () => {
    const { changedValues } = await import('../src/features/portal/form-data')
    const fields = [
        { name: 'consultationCategoryId', label: 'Category', numeric: true },
        { name: 'price', label: 'Price', type: 'number' as const },
        { name: 'titleUa', label: 'Title' },
        { name: 'startsAt', label: 'Start', type: 'datetime-local' as const },
    ]
    assert.deepEqual(
        changedValues(
            fields,
            {
                consultationCategoryId: 3,
                price: 150,
                titleUa: 'Оновлена',
                startsAt: '2030-07-15T08:30:00.000Z',
            },
            {
                consultationCategoryId: 3,
                price: '150.00',
                titleUa: 'Попередня',
                startsAt: '2030-07-15T10:30:00+02:00',
            },
        ),
        { titleUa: 'Оновлена' },
    )
})
