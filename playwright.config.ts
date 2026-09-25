import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
    testDir: './tests/browser',
    fullyParallel: true,
    workers: 2,
    retries: 0,
    use: {
        baseURL: 'http://127.0.0.1:3102',
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    webServer: {
        command: 'npm run dev -- --port 3102',
        url: 'http://127.0.0.1:3102/auth',
        reuseExistingServer: false,
        timeout: 120000,
        env: {
            NEXT_PUBLIC_API_URL: 'http://portal-api.test',
            NEXT_DIST_DIR: '.next-test',
        },
    },
})
