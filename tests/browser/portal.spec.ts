import { test, expect, type Page } from '@playwright/test'
const timestamp = '2026-09-09T10:00:00Z'
const company = {
    id: 1,
    companyName: 'Власна компанія',
    partnerId: 20,
    status: 'draft',
    contactEmail: 'office@example.com',
    phone: '+48123456789',
    logoId: null,
    info: {},
    createdAt: timestamp,
    updatedAt: timestamp,
}
const consultation = {
    id: 1,
    titleUa: 'Юридична консультація',
    titlePl: 'Konsultacja',
    titleEn: 'Consultation',
    titleRu: 'Консультация',
    descriptionUa: 'Opis',
    descriptionPl: 'Opis',
    descriptionEn: 'Description',
    descriptionRu: 'Описание',
    consultationCategoryId: 3,
    durationMinutes: 30,
    price: '150.00',
    lans: ['UA'],
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
}
const booking = {
    id: 1,
    specialistConsultation: consultation,
    startsAt: timestamp,
    endsAt: timestamp,
    status: 'paid',
    price: '150.00',
    currency: 'PLN',
    user: { name: 'Ірина', surname: 'Коваль' },
    userText: 'Потрібна допомога з документами',
    meetingStatus: 'ready',
    meetingUrl: 'https://meet.example.com/room',
    userFileAssetId: 9,
    userFileName: 'request.txt',
    createdAt: timestamp,
}
async function api(
    page: Page,
    role: 'PARTNERS' | 'SPECIALISTS' | 'MANAGERS' = 'PARTNERS',
) {
    const requests: { path: string; method: string; body: string | null }[] = []
    let currentCompany = { ...company }
    let currentConsultation = { ...consultation }
    await page.route('http://portal-api.test/**', async (route) => {
        const request = route.request()
        const url = new URL(request.url())
        const path = url.pathname
        const method = request.method()
        requests.push({ path, method, body: request.postData() })
        const json = (body: unknown, status = 200) =>
            route.fulfill({ json: body, status })
        const paged = (rows: unknown[]) =>
            json({ rows, total: rows.length, page: 1, limit: 20, offset: 0 })
        if (path === '/account-auth/login') return json({ token: 'test-token' })
        if (path.startsWith('/account-auth/')) return json({ ok: true })
        if (request.headers()['authorization'] !== 'Bearer test-token')
            return json({ message: 'Authentication required' }, 401)
        if (path === '/account/me')
            return json({
                id: 10,
                email: 'test@example.com',
                type: role,
                status: 'active',
                avatarId: null,
            })
        if (path === '/partners/me' || path === '/specialists/me')
            return json({
                id: 20,
                accountId: 10,
                name: 'Олександр',
                surname: 'Шевченко',
                info: { title: 'Юрист', languages: ['UA'] },
            })
        if (path === '/partner-companies/my') return paged([currentCompany])
        if (path === '/partner-companies' && method === 'POST') {
            currentCompany = { ...currentCompany, ...request.postDataJSON() }
            return json(currentCompany)
        }
        if (path === '/partner-companies/my/1') {
            if (method === 'PATCH')
                currentCompany = {
                    ...currentCompany,
                    ...request.postDataJSON(),
                }
            return json(currentCompany)
        }
        if (path === '/partner-company-info/my/1') return json({})
        if (path === '/partner-banners/my') return paged([])
        if (path === '/specialist-consultations/my')
            return paged([currentConsultation])
        if (path === '/consultation-categories/active')
            return paged([{ id: 3, titleUa: 'Право', titlePl: 'Prawo' }])
        if (path === '/specialist-consultations' && method === 'POST') {
            currentConsultation = {
                ...currentConsultation,
                ...request.postDataJSON(),
            }
            return json(currentConsultation)
        }
        if (path === '/specialist-consultations/1') {
            if (method === 'PATCH')
                currentConsultation = {
                    ...currentConsultation,
                    ...request.postDataJSON(),
                }
            return json(currentConsultation)
        }
        if (path === '/consultation-slots/my') return paged([])
        if (path === '/consultation-slots' && method === 'POST')
            return json({ id: 1, ...request.postDataJSON() })
        if (path === '/consultation-slots/my/1')
            return json({
                id: 1,
                startsAt: '2030-07-15T08:30:00Z',
                endsAt: '2030-07-15T09:00:00Z',
                status: 'booked',
                specialistConsultation: consultation,
                createdAt: timestamp,
            })
        if (path === '/consultation-bookings/specialist/my')
            return paged([booking])
        if (path === '/consultation-bookings/specialist/my/1')
            return json(booking)
        if (path === '/consultation-bookings/specialist/my/1/file')
            return route.fulfill({
                body: 'client file',
                contentType: 'application/octet-stream',
            })
        if (path === '/consultation-reviews/specialist/20')
            return paged([
                {
                    id: 1,
                    rating: 5,
                    comment: 'Дякую за допомогу!',
                    user: { name: 'Ірина' },
                    createdAt: timestamp,
                },
            ])
        return json({ message: `Unexpected endpoint: ${method} ${path}` }, 404)
    })
    return requests
}
async function login(page: Page) {
    await page.goto('/auth')
    await page
        .getByLabel('Adres e-mail', { exact: true })
        .fill('test@example.com')
    await page.getByLabel('Hasło', { exact: true }).fill('password123')
    await page.getByRole('button', { name: 'Zaloguj się' }).click()
    await expect(
        page.getByRole('heading', { name: 'Witaj, Олександр!' }),
    ).toBeVisible()
}
test('partner navigation, direct route denial, theme and logout', async ({
    page,
}) => {
    const calls = await api(page)
    await login(page)
    await expect(
        page
            .getByRole('navigation', { name: 'Nawigacja główna' })
            .getByText('Moje firmy'),
    ).toBeVisible()
    await expect(
        page
            .getByRole('navigation', { name: 'Nawigacja główna' })
            .getByText('Rezerwacje'),
    ).toHaveCount(0)
    await page.getByRole('button', { name: 'Ciemny motyw' }).click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'black')
    await page.goto('/main/bookings')
    await expect(
        page.getByRole('heading', { name: 'Strona niedostępna' }),
    ).toBeVisible()
    expect(calls.some((c) => c.path.includes('consultation-bookings'))).toBe(
        false,
    )
    await page.getByRole('button', { name: 'Wyloguj się' }).click()
    await expect(page).toHaveURL(/\/auth$/)
    expect(
        await page.evaluate(() =>
            localStorage.getItem('residdy_portal_access_token'),
        ),
    ).toBeNull()
})
test('manager credentials are refused without storing a token', async ({
    page,
}) => {
    await api(page, 'MANAGERS')
    await page.goto('/auth')
    await page.getByLabel('Adres e-mail').fill('test@example.com')
    await page.getByLabel('Hasło', { exact: true }).fill('password123')
    await page.getByRole('button', { name: 'Zaloguj się' }).click()
    await expect(
        page.getByRole('alert').filter({ hasText: /.+/ }),
    ).toContainText('tylko dla partnerów i specjalistów')
    expect(
        await page.evaluate(() =>
            localStorage.getItem('residdy_portal_access_token'),
        ),
    ).toBeNull()
})
test('partner companies are read-only and direct create route is denied', async ({ page }) => {
    const calls = await api(page)
    await login(page)
    await page.goto('/main/companies')
    await expect(page.getByRole('link', { name: 'Utwórz', exact: true })).toHaveCount(0)
    await page.goto('/main/companies/new')
    await expect(page.getByRole('heading', { name: 'Strona niedostępna' })).toBeVisible()
    await page.goto('/main/companies/1')
    await expect(page.getByText('Dane i publikację firmy obsługuje administrator.', { exact: false })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Zapisz zmiany' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Opublikuj firmę' })).toHaveCount(0)
    expect(calls.filter(c => c.path.startsWith('/partner-compan') && c.method !== 'GET')).toEqual([])
})
test('specialist creates consultation using public categories and typed payload', async ({
    page,
}) => {
    const calls = await api(page, 'SPECIALISTS')
    await login(page)
    await page.goto('/main/consultations/new')
    await choose(page, 'Kategoria', 'Prawo')
    await page.getByLabel('Czas trwania').fill('45')
    await page.getByLabel('Cena').fill('199.50')
    for (const lang of ['Ukraiński', 'Polski', 'Angielski', 'Rosyjski']) {
        await page.getByLabel(`Nazwa · ${lang}`).fill(`Послуга ${lang}`)
        await page.getByLabel(`Opis · ${lang}`).fill('Детальний опис послуги')
    }
    await page.getByRole('button', { name: 'Utwórz', exact: true }).click()
    await expect(page).toHaveURL(/consultations\/1$/)
    const body = JSON.parse(
        calls.find(
            (c) =>
                c.path === '/specialist-consultations' && c.method === 'POST',
        )!.body!,
    )
    expect(body.consultationCategoryId).toBe(3)
    expect(body.price).toBe(199.5)
    expect(body.durationMinutes).toBe(45)
    expect(body.lans).toEqual(['UA'])
    expect(calls.some((c) => c.path === '/consultation-categories')).toBe(false)
})
test('Warsaw slot creation sends UTC and booked slot has no editing actions', async ({
    page,
}) => {
    const calls = await api(page, 'SPECIALISTS')
    await login(page)
    await page.goto('/main/schedule/new')
    await choose(page, 'Konsultacja', 'Konsultacja')
    await page.getByLabel('Początek').fill('2030-07-15T10:30')
    await page.getByRole('button', { name: 'Utwórz', exact: true }).click()
    await expect(page).toHaveURL(/schedule\/1$/)
    expect(
        JSON.parse(
            calls.find(
                (c) => c.path === '/consultation-slots' && c.method === 'POST',
            )!.body!,
        ).startsAt,
    ).toBe('2030-07-15T08:30:00.000Z')
    await expect(
        page.getByRole('button', { name: 'Anuluj termin' }),
    ).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Edycja' })).toHaveCount(0)
})
test('booking meeting and authenticated download; no manager actions', async ({
    page,
}) => {
    const calls = await api(page, 'SPECIALISTS')
    await login(page)
    await page.goto('/main/bookings/1')
    await expect(
        page.getByText('Потрібна допомога з документами'),
    ).toBeVisible()
    await expect(
        page.getByRole('link', { name: 'Otwórz spotkanie' }),
    ).toHaveAttribute('href', 'https://meet.example.com/room')
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Pobierz request.txt' }).click()
    expect((await download).suggestedFilename()).toBe('request.txt')
    expect(
        calls.some(
            (c) => c.path === '/consultation-bookings/specialist/my/1/file',
        ),
    ).toBe(true)
    await expect(
        page.getByRole('button', { name: /Anuluj rezerwację/ }),
    ).toHaveCount(0)
})
test('network errors have retry and recover without fake data', async ({
    page,
}) => {
    await api(page)
    await login(page)
    let fail = true
    await page.route(
        'http://portal-api.test/partner-companies/my?**',
        (route) =>
            fail
                ? route.fulfill({
                      status: 503,
                      json: { message: 'Сервіс тимчасово недоступний' },
                  })
                : route.fallback(),
    )
    await page.goto('/main/companies')
    await expect(
        page.getByRole('alert').filter({ hasText: /.+/ }),
    ).toContainText('Nie udało się wykonać operacji')
    fail = false
    await page.getByRole('button', { name: 'Spróbuj ponownie' }).click()
    await expect(
        page.getByRole('link', { name: 'Власна компанія' }),
    ).toBeVisible()
})
test('manager shell proportions, grouped menu and breadcrumbs', async ({
    page,
}) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await api(page, 'SPECIALISTS')
    await login(page)
    await expect(page.locator('aside')).toHaveCSS('width', '246px')
    await expect(page.locator('header').first()).toHaveCSS('height', '70px')
    await expect(page.locator('body')).toHaveCSS('font-size', '14px')
    await expect(page.locator('html')).toHaveCSS('font-family', /Inter/)
    const group = page
        .locator('details')
        .filter({ has: page.locator('summary', { hasText: 'Konsultacje' }) })
    await group.locator('summary').click()
    await expect(group).not.toHaveAttribute('open', '')
    await group.locator('summary').click()
    await group.getByRole('link', { name: 'Opinie' }).click()
    await expect(
        page.getByRole('navigation', { name: 'Ścieżka nawigacji' }),
    ).toContainText('Opinie')
    await expect(page.getByText('Дякую за допомогу!')).toBeVisible()
    await page.screenshot({
        path: 'test-results/specialist-desktop.png',
        fullPage: true,
    })
})
test('invalid id never issues detail request', async ({ page }) => {
    const calls = await api(page)
    await login(page)
    await page.goto('/main/companies/NaN')
    await expect(
        page.getByRole('heading', { name: 'Strona niedostępna' }),
    ).toBeVisible()
    expect(calls.some((c) => c.path.endsWith('/NaN'))).toBe(false)
})
test('expired session redirects to login and clears stored token', async ({
    page,
}) => {
    await api(page)
    await login(page)
    await page.route(
        'http://portal-api.test/partner-companies/my?**',
        (route) =>
            route.fulfill({ status: 401, json: { message: 'Expired token' } }),
    )
    await page.goto('/main/companies')
    await expect(page).toHaveURL(/\/auth$/)
    expect(
        await page.evaluate(() =>
            localStorage.getItem('residdy_portal_access_token'),
        ),
    ).toBeNull()
})
test('desktop overview screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await api(page)
    await login(page)
    await page.screenshot({
        path: 'test-results/partner-desktop.png',
        fullPage: true,
    })
})
test('banner creation uploads localized multipart data for an active own company', async ({
    page,
}) => {
    await api(page)
    await login(page)
    await page.route(
        'http://portal-api.test/partner-companies/my?**',
        (route) =>
            route.fulfill({
                json: { rows: [{ ...company, status: 'active' }], total: 1 },
            }),
    )
    let submitted = ''
    await page.route(
        'http://portal-api.test/partner-banners/my',
        async (route) => {
            submitted = route.request().postData() || ''
            await route.fulfill({ json: { id: 2 } })
        },
    )
    await page.route('http://portal-api.test/partner-banners/my/2', (route) =>
        route.fulfill({
            json: {
                id: 2,
                companyId: 1,
                company: { ...company, status: 'active' },
                status: 'pending_review',
                type: 'big',
                titleUa: 'Реклама Ukraiński',
                createdAt: timestamp,
                updatedAt: timestamp,
                viewsCount: 0,
                clicksCount: 0,
                linkUrl: 'https://example.com',
            },
        }),
    )
    await page.goto('/main/banners/new')
    await choose(page, 'Firma', 'Власна компанія')
    await choose(page, 'Format', 'Duży baner')
    for (const lang of ['Ukraiński', 'Polski', 'Angielski', 'Rosyjski']) {
        await page
            .getByLabel(`Tytuł · ${lang} *`, { exact: true })
            .fill(`Реклама ${lang}`)
        await page
            .getByLabel(`Podtytuł · ${lang}`)
            .fill('Opis рекламної пропозиції')
    }
    await page.getByLabel('Link', { exact: false }).fill('https://example.com')
    await page.getByLabel('Obraz', { exact: false }).setInputFiles({
        name: 'banner.png',
        mimeType: 'image/png',
        buffer: Buffer.from('test-image'),
    })
    await page.getByRole('button', { name: 'Utwórz', exact: true }).click()
    await expect(page).toHaveURL(/banners\/2$/)
    expect(submitted).toContain('name="companyId"')
    expect(submitted).toContain('name="titleUa"')
    expect(submitted).toContain('filename="banner.png"')
    await expect(page.getByText('W moderacji').first()).toBeVisible()
})
test('active banner is read only and shows translated content', async ({
    page,
}) => {
    await api(page)
    await login(page)
    await page.route('http://portal-api.test/partner-banners/my/1', (route) =>
        route.fulfill({
            json: {
                id: 1,
                titleUa: 'Активна реклама',
                titleEn: 'Active campaign',
                subtitleUa: 'Пропозиція',
                status: 'active',
                createdAt: timestamp,
                viewsCount: 200,
                clicksCount: 10,
                linkUrl: 'https://example.com',
            },
        }),
    )
    await page.goto('/main/banners/1')
    await expect(page.getByRole('heading', { name: 'Edycja' })).toHaveCount(0)
    await expect(page.getByText('5,00%')).toBeVisible()
    await expect(page.getByText('Active campaign')).toBeVisible()
})
test('banner format changes preview and image guidance', async ({ page }) => {
    await api(page)
    await login(page)
    await page.goto('/main/banners/new')
    await choose(page, 'Format', 'Mały baner')
    await expect(page.getByText('Mały baner: karta 370 × 120.', { exact: false })).toBeVisible()
    await page.getByLabel('Tytuł · Polski *', { exact: true }).fill('Reklama testowa')
    await expect(page.getByLabel('Podgląd banera').getByText('Reklama testowa')).toBeVisible()
    await choose(page, 'Format', 'Duży baner')
    await expect(page.getByText('Duży plakat: proporcje 37:50', { exact: false })).toBeVisible()
})
test('password change uses two steps and clears session after confirmation', async ({
    page,
}) => {
    const calls = await api(page)
    await login(page)
    await page.goto('/main/security')
    const section = page.locator('section').filter({
        has: page.getByRole('heading', {
            name: 'Zmień hasło',
            exact: true,
        }),
    })
    await section.getByLabel('Obecne hasło').fill('password123')
    await section.getByRole('button', { name: 'Otrzymaj kod' }).click()
    await section.getByLabel('Obecne hasło').fill('password123')
    await section.getByLabel('Kod z wiadomości e-mail').fill('123456')
    await section
        .getByLabel('Nowe hasło', { exact: false })
        .first()
        .fill('newPassword123')
    await section.getByLabel('Powtórz nowe hasło').fill('newPassword123')
    await section
        .getByRole('button', { name: 'Potwierdź zmianę hasła' })
        .click()
    await expect(page).toHaveURL(/\/auth$/)
    expect(
        calls.some((c) => c.path === '/account-auth/request-password-change'),
    ).toBe(true)
    const body = JSON.parse(
        calls.find((c) => c.path === '/account-auth/change-password')!.body!,
    )
    expect(body).toEqual({
        currentPassword: 'password123',
        code: '123456',
        password: 'newPassword123',
    })
})
test('confirmation and recovery send public auth DTOs', async ({ page }) => {
    const calls = await api(page)
    await page.goto('/confirm-account')
    await page.getByLabel('Adres e-mail').fill('test@example.com')
    await page.getByLabel('Kod z wiadomości e-mail').fill('123456')
    await page
        .getByRole('button', { name: 'Potwierdź konto', exact: true })
        .click()
    await expect(
        page.getByText('Konto zostało potwierdzone. Możesz się zalogować.'),
    ).toBeVisible()
    await page.goto('/forgot-password')
    await page.getByLabel('Adres e-mail').fill('test@example.com')
    await page.getByRole('button', { name: 'Wyślij kod', exact: true }).click()
    await expect(page.getByText('Jeśli konto istnieje')).toBeVisible()
    expect(calls.some((c) => c.path === '/account-auth/confirm')).toBe(true)
    expect(calls.some((c) => c.path === '/account-auth/forgot-password')).toBe(
        true,
    )
})
test('filter and pagination are sent to the server', async ({ page }) => {
    await api(page)
    await login(page)
    const seen: string[] = []
    await page.route(
        'http://portal-api.test/partner-companies/my?**',
        (route) => {
            seen.push(route.request().url())
            return route.fulfill({ json: { rows: [company], total: 41 } })
        },
    )
    await page.goto('/main/companies')
    await page.getByRole('button', { name: 'Następna strona' }).click()
    await expect(page.getByText('Strona 2 z 3', { exact: false })).toBeVisible()
    expect(
        seen.some((url) => new URL(url).searchParams.get('page') === '2'),
    ).toBe(true)
    await page
        .getByRole('combobox', { name: 'Status', exact: true })
        .selectOption('draft')
    await expect(page.getByText('Strona 1 z 3', { exact: false })).toBeVisible()
    expect(
        seen.some((url) => new URL(url).searchParams.get('status') === 'draft'),
    ).toBe(true)
})
test('specialist direct partner URL is denied; stored token is validated against server', async ({
    page,
}) => {
    const calls = await api(page, 'SPECIALISTS')
    await page.addInitScript(() =>
        localStorage.setItem('residdy_portal_access_token', 'test-token'),
    )
    await page.goto('/main/companies')
    await expect(
        page.getByRole('heading', { name: 'Strona niedostępna' }),
    ).toBeVisible()
    expect(calls.some((c) => c.path.startsWith('/partner-companies'))).toBe(
        false,
    )
    expect(calls.some((c) => c.path === '/account/me')).toBe(true)
})

test('archived consultation can be restored without resending an inactive category', async ({
    page,
}) => {
    await api(page, 'SPECIALISTS')
    await login(page)
    let status = 'archived'
    let payload: Record<string, unknown> = {}
    await page.route(
        'http://portal-api.test/consultation-categories/active?**',
        (route) => route.fulfill({ json: { rows: [], total: 0 } }),
    )
    await page.route(
        'http://portal-api.test/specialist-consultations/1',
        (route) => {
            if (route.request().method() === 'PATCH') {
                payload = route.request().postDataJSON()
                status = String(payload.status)
            }
            return route.fulfill({ json: { ...consultation, status } })
        },
    )
    await page.goto('/main/consultations/1')
    await choose(page, 'Status', 'Nieaktywny')
    await page
        .getByRole('button', { name: 'Zapisz zmiany', exact: true })
        .click()
    await expect(page.getByText('Zmiany zostały zapisane.')).toBeVisible()
    expect(payload).toEqual({ status: 'inactive' })
})

async function choose(page: Page, label: string, option: string) {
    await page.getByRole('button', { name: new RegExp('^' + label) }).click()
    await page.getByRole('option', { name: option, exact: true }).click()
}

test('login uses the manager auth shell and original theme logos', async ({
    page,
}) => {
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.goto('/auth')
    await expect(page.getByRole('img', { name: 'Residdy' })).toBeVisible()
    await expect(page.locator('form')).toHaveCSS('width', '420px')
    await expect(page.locator('form')).toHaveCSS('padding', '28px')
    await page.screenshot({
        path: 'test-results/auth-desktop.png',
        fullPage: true,
    })
    await page
        .getByRole('button', { name: 'Ciemny motyw', exact: true })
        .click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'black')
    await expect(page.getByRole('button', { name: 'Zaloguj się' })).toHaveCSS(
        'background-color',
        'rgb(164, 170, 183)',
    )
    await expect(page.getByRole('button', { name: 'Zaloguj się' })).toHaveCSS(
        'color',
        'rgb(23, 28, 38)',
    )
    await page.screenshot({
        path: 'test-results/auth-dark.png',
        fullPage: true,
    })
})
