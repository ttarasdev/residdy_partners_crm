'use client'
import Link from 'next/link'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { http } from '@/api/http'
import { download } from '@/api/portal'
import { useAuth } from '@/shared/hooks/useAuth'
import { Badge, Action, Failure, Loading } from '@/components/ui/Common'
import { resources, infoFields, valueAt, type ResourceName } from '../resources'
import { Cell, type Row } from './ResourceList'
import { dateTime } from '../time'
import Editor from './Editor'
import Media, { ImagePreview } from './Media'
import s from './portal.module.scss'
export function safeUrl(value: unknown): string | undefined {
    if (typeof value !== 'string') return
    try {
        const url = new URL(value)
        if (
            ['https:', 'http:'].includes(url.protocol) &&
            !url.username &&
            !url.password
        )
            return url.href
    } catch {}
}
export function companyMissing(record: Row): string[] {
    const items = [
        ['companyName', 'Nazwa'],
        ['contactEmail', 'E-mail'],
        ['phone', 'Telefon'],
        ['logoId', 'Logo'],
        ['info.mainPhotoId', 'Zdjęcie główne'],
        ['info.websiteUrl', 'Strona internetowa'],
        ...['Ua', 'Pl', 'En', 'Ru'].flatMap((lang) => [
            [
                `info.shortDescription${lang}`,
                `Krótki opis · ${{ Ua: 'Ukraiński', Pl: 'Polski', En: 'Angielski', Ru: 'Rosyjski' }[lang]}`,
            ],
            [
                `info.description${lang}`,
                `Pełny opis · ${{ Ua: 'Ukraiński', Pl: 'Polski', En: 'Angielski', Ru: 'Rosyjski' }[lang]}`,
            ],
        ]),
    ]
    return items
        .filter(([key]) => !valueAt(record, key))
        .map(([, label]) => label)
}
export default function ResourceDetail({
    name,
    id,
}: {
    name: ResourceName
    id: number
}) {
    const { session } = useAuth()
    const client = useQueryClient()
    const router = useRouter()
    const resource = resources[name]
    const query = useQuery({
        queryKey: ['portal', session!.account.id, name, id],
        queryFn: ({ signal }) =>
            http.get<Row>(`${resource.detail}/${id}`, { signal }),
        enabled: Boolean(resource.detail),
    })
    if (query.isPending) return <Loading />
    if (query.error)
        return (
            <Failure error={query.error} retry={() => void query.refetch()} />
        )
    const record = query.data!
    const status = String(record.status ?? '')
    const editable =
        Boolean(resource.edit) &&
        !(name === 'companies' && ['blocked', 'archived'].includes(status)) &&
        !(
            name === 'banners' &&
            (['active', 'finished'].includes(status) ||
                ['blocked', 'archived'].includes(
                    String(valueAt(record, 'company.status')),
                ))
        ) &&
        !(name === 'schedule' && status !== 'open')
    const info =
        record.info && typeof record.info === 'object' ? record.info : {}
    const refresh = () => client.invalidateQueries({ queryKey: ['portal'] })
    const meeting = safeUrl(record.meetingUrl)
    return (
        <>
            <Link href={`/main/${name}`} className={s.back}>
                <ArrowLeft size={15} />
                {resource.title}
            </Link>
            <div className={s.heading}>
                <div>
                    <h1>
                        {String(
                            record.companyName ??
                                record.titlePl ??
                                `${resource.singular} #${id}`,
                        )}
                    </h1>
                    <p>
                        Rekord #{id} · {dateTime(String(record.createdAt))}
                    </p>
                </div>
                {status && <Badge status={status} />}
            </div>
            <div className={s.stack}>
                <section className={s.card}>
                    <h2>Szczegóły</h2>
                    <dl className={s.details}>
                        {resource.columns.map((column) => (
                            <div key={column.key}>
                                <dt>{column.label}</dt>
                                <dd>
                                    <Cell row={record} column={column} />
                                </dd>
                            </div>
                        ))}
                        {name === 'banners' && (
                            <>
                                <div>
                                    <dt>CTR</dt>
                                    <dd>
                                        {Number(record.viewsCount)
                                            ? (
                                                  (100 *
                                                      Number(
                                                          record.clicksCount,
                                                      )) /
                                                  Number(record.viewsCount)
                                              ).toLocaleString('pl-PL', {
                                                  minimumFractionDigits: 2,
                                                  maximumFractionDigits: 2,
                                              })
                                            : '0,00'}
                                        %
                                    </dd>
                                </div>
                                <div>
                                    <dt>Link</dt>
                                    <dd>
                                        {safeUrl(record.linkUrl) ? (
                                            <a
                                                href={safeUrl(record.linkUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {String(record.linkUrl)}
                                            </a>
                                        ) : (
                                            '—'
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Zakończenie</dt>
                                    <dd>
                                        {dateTime(
                                            record.endDate as string | null,
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Limit wyświetleń</dt>
                                    <dd>
                                        {String(
                                            record.maxViews ?? 'Bez limitu',
                                        )}
                                    </dd>
                                </div>
                            </>
                        )}
                        {name === 'bookings' && (
                            <>
                                <div>
                                    <dt>Klient</dt>
                                    <dd>
                                        {String(
                                            valueAt(record, 'user.name') ?? '',
                                        )}{' '}
                                        {String(
                                            valueAt(record, 'user.surname') ??
                                                '',
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt>Zgłoszenie klienta</dt>
                                    <dd>{String(record.userText ?? '—')}</dd>
                                </div>
                                <div>
                                    <dt>Zakończenie</dt>
                                    <dd>{dateTime(String(record.endsAt))}</dd>
                                </div>
                                <div>
                                    <dt>Waluta</dt>
                                    <dd>{String(record.currency ?? '—')}</dd>
                                </div>
                                <div>
                                    <dt>Status spotkania</dt>
                                    <dd>
                                        <Badge
                                            status={String(
                                                record.meetingStatus,
                                            )}
                                        />
                                    </dd>
                                </div>
                                <div>
                                    <dt>Zwrot środków</dt>
                                    <dd>
                                        {String(record.refundStatus ?? '—')}
                                    </dd>
                                </div>
                            </>
                        )}
                    </dl>
                </section>
                {name === 'bookings' && (
                    <section className={s.card}>
                        <h2>Materiały i spotkanie</h2>
                        <div className={s.stack}>
                            {meeting &&
                            record.meetingStatus === 'ready' &&
                            ['paid', 'completed'].includes(status) ? (
                                <a
                                    className={s.button}
                                    href={meeting}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ExternalLink size={16} />
                                    Otwórz spotkanie
                                </a>
                            ) : (
                                <p className={s.muted}>
                                    Link pojawi się po przygotowaniu spotkania.
                                </p>
                            )}
                            {record.userFileAssetId ? (
                                <Action
                                    label={`Pobierz ${record.userFileName ?? 'plik klienta'}`}
                                    run={() =>
                                        download(
                                            `/consultation-bookings/specialist/my/${id}/file`,
                                            String(
                                                record.userFileName ??
                                                    `booking-${id}`,
                                            ),
                                        )
                                    }
                                />
                            ) : (
                                <p className={s.muted}>
                                    Klient nie dodał pliku.
                                </p>
                            )}
                        </div>
                    </section>
                )}
                {name === 'banners' && (
                    <>
                        {Boolean(record.rejectReason) && (
                            <div className={s.error}>
                                Powód odrzucenia: {String(record.rejectReason)}
                            </div>
                        )}
                        {typeof record.photoId === 'number' && (
                            <section className={s.card}>
                                <h2>Obraz banera</h2>
                                <ImagePreview
                                    id={record.photoId}
                                    alt={String(record.titlePl)}
                                />
                            </section>
                        )}
                    </>
                )}
                {!editable &&
                    (name === 'banners' || name === 'consultations') && (
                        <section className={s.card}>
                            <h2>Wersje językowe</h2>
                            <dl className={s.details}>
                                {resource.fields
                                    ?.filter((f) =>
                                        /(?:Ua|Pl|En|Ru)$/.test(f.name),
                                    )
                                    .map((f) => (
                                        <div key={f.name}>
                                            <dt>{f.label}</dt>
                                            <dd>
                                                {String(record[f.name] ?? '—')}
                                            </dd>
                                        </div>
                                    ))}
                            </dl>
                        </section>
                    )}
                {editable && <Editor name={name} record={record} />}
                {name === 'companies' && (
                    <>
                        <section className={s.card}>
                            <h2>Strona firmy</h2>
                            <p className={s.notice}>
                                Dane i publikację firmy obsługuje administrator.
                                Aby wprowadzić zmiany, skontaktuj się z zespołem
                                Residdy.
                            </p>
                            <dl className={s.details}>
                                {infoFields.map((f) => (
                                    <div key={f.name}>
                                        <dt>{f.label}</dt>
                                        <dd>
                                            {String(
                                                valueAt(info, f.name) ?? '—',
                                            )}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </section>
                        <div className={s.grid}>
                            <Media
                                title="Logo firmy"
                                path={`/partner-companies/my/${id}/logo`}
                                id={record.logoId as number | null}
                                editable={editable}
                            />
                            <Media
                                title="Zdjęcie główne"
                                path={`/partner-company-info/my/${id}/photo`}
                                id={
                                    valueAt(record, 'info.mainPhotoId') as
                                        | number
                                        | null
                                }
                                editable={editable}
                            />
                        </div>
                    </>
                )}
                {((name === 'consultations' && status !== 'archived') ||
                    (name === 'schedule' && status === 'open')) && (
                    <section className={s.card}>
                        <h2>
                            {name === 'schedule'
                                ? 'Anulowanie terminu'
                                : 'Archiwizacja'}
                        </h2>
                        <Action
                            label={
                                name === 'schedule'
                                    ? 'Anuluj termin'
                                    : 'Archiwizuj konsultację'
                            }
                            danger
                            confirm={
                                name === 'schedule'
                                    ? 'Anulować ten wolny termin?'
                                    : 'Zarchiwizować konsultację? Serwer sprawdzi powiązane rezerwacje.'
                            }
                            run={async () => {
                                await http.delete(`${resource.edit}/${id}`)
                                await refresh()
                                router.push(`/main/${name}`)
                            }}
                        />
                    </section>
                )}
            </div>
        </>
    )
}
