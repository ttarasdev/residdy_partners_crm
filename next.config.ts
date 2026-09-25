import type { NextConfig } from 'next'
const config: NextConfig = {
    reactStrictMode: true,
    devIndicators: false,
    allowedDevOrigins: ['127.0.0.1'],
    distDir: process.env.NEXT_DIST_DIR || '.next',
    poweredByHeader: false,
}
export default config
