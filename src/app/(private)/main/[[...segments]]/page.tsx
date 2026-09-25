import PortalRouter from '@/features/portal/components/PortalRouter'
export default async function Page({
    params,
}: {
    params: Promise<{ segments?: string[] }>
}) {
    const { segments = [] } = await params
    return <PortalRouter segments={segments} />
}
