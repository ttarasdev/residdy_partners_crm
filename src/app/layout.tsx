import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/shared/providers/Providers'
import './globals.scss'
const inter = Inter({
    subsets: ['latin', 'latin-ext'],
    weight: ['100', '200', '300', '400', '500', '600', '700'],
    display: 'swap',
    variable: '--font-inter',
})
export const metadata: Metadata = {
    title: { default: 'Residdy Workflow', template: '%s · Residdy' },
    description: 'Panel partnerów i specjalistów Residdy',
    robots: { index: false, follow: false },
}
export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html
            lang="pl"
            className={`${inter.className} ${inter.variable}`}
            suppressHydrationWarning
        >
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
