import { redirect } from 'next/navigation'
export default async function Page({
    params,
}: {
    params: Promise<{ segments?: string[] }>
}) {
    const { segments = [] } = await params
    redirect(
        `/main${segments.length ? '/' + segments.map(encodeURIComponent).join('/') : ''}`,
    )
}
