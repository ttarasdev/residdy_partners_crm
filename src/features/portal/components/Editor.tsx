'use client'
import BannerPreview from './BannerPreview'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { http } from '@/api/http'
import { list } from '@/api/portal'
import { useAuth } from '@/shared/hooks/useAuth'
import { Failure, Loading } from '@/components/ui/Common'
import Form, { type Field } from './Form'
import { changedValues } from '../form-data'
import { resources, type ResourceName } from '../resources'
import type { Row } from './ResourceList'
import s from './portal.module.scss'
async function options(
    path: string,
    query: Record<string, string>,
    signal: AbortSignal,
) {
    const rows: Row[] = []
    for (let page = 1; ; page++) {
        const result = await list<Row>(
            path,
            { ...query, page, limit: 100 },
            signal,
        )
        rows.push(...result.rows)
        if (rows.length >= result.total || result.rows.length === 0) break
        if (page >= 10000) throw new Error('Zbyt wiele rekordów do wyboru.')
    }
    return rows
}
export default function Editor({
    name,
    record,
}: {
    name: ResourceName
    record?: Row
}) {
    const resource = resources[name]
    const { session } = useAuth()
    const router = useRouter()
    const client = useQueryClient()
    const related =
        name === 'banners' && !record
            ? {
                  path: '/partner-companies/my',
                  filter: { status: 'active' },
                  field: 'companyId',
                  label: 'companyName',
              }
            : name === 'consultations'
              ? {
                    path: '/consultation-categories/active',
                    filter: {},
                    field: 'consultationCategoryId',
                    label: 'titlePl',
                }
              : name === 'schedule' && !record
                ? {
                      path: '/specialist-consultations/my',
                      filter: { status: 'active' },
                      field: 'specialistConsultationId',
                      label: 'titlePl',
                  }
                : undefined
    const relation = useQuery({
        queryKey: ['portal', session!.account.id, 'options', name],
        enabled: Boolean(related),
        queryFn: ({ signal }) =>
            options(
                related!.path,
                related!.filter as Record<string, string>,
                signal,
            ),
    })
    if (related && relation.isPending) return <Loading />
    if (related && relation.error)
        return (
            <Failure
                error={relation.error}
                retry={() => void relation.refetch()}
            />
        )
    let fields: Field[] = (resource.fields ?? []).filter(
        (f) =>
            !(
                record &&
                ((name === 'banners' && f.name === 'companyId') ||
                    (name === 'schedule' && f.name !== 'startsAt'))
            ),
    )
    if (related)
        fields = fields.map((f) =>
            f.name === related.field
                ? {
                      ...f,
                      options: [
                          ...(relation.data ?? []).map((row) => ({
                              value: String(row.id),
                              label: String(row[related.label] ?? `#${row.id}`),
                          })),
                          ...(record &&
                          !relation.data?.some(
                              (row) =>
                                  String(row.id) ===
                                  String(record[related.field]),
                          )
                              ? [
                                    {
                                        value: String(record[related.field]),
                                        label: `Bieżąca kategoria #${record[related.field]}`,
                                    },
                                ]
                              : []),
                      ],
                  }
                : f,
        )
    return (
        <section className={s.card}>
            <h2>
                {record
                    ? 'Edycja'
                    : {
                          companies: 'Nowa firma',
                          banners: 'Nowy baner',
                          consultations: 'Nowa konsultacja',
                          schedule: 'Nowy termin',
                          bookings: 'Nowa rezerwacja',
                          reviews: 'Nowa opinia',
                      }[name]}
            </h2>
            {name === 'banners' && (
                <p className={s.notice}>
                    Baner automatycznie trafia do moderacji. Po edycji wymaga
                    ponownego zatwierdzenia przez menedżera.
                </p>
            )}
            {name === 'consultations' && record && (
                <p className={s.notice}>
                    Nie można zmienić czasu trwania, gdy istnieją przyszłe
                    terminy. Nieaktywna lub zarchiwizowana konsultacja nie jest
                    dostępna do nowych rezerwacji.
                </p>
            )}
            {name === 'schedule' && (
                <p className={s.notice}>
                    Podaj godzinę w czasie warszawskim. Czas trwania wynika z
                    konsultacji. Klienci mogą rezerwować terminy od następnego
                    dnia.
                </p>
            )}
            {related && !relation.data?.length && (
                <p className={s.notice}>
                    {name === 'banners'
                        ? 'Najpierw utwórz i opublikuj firmę.'
                        : name === 'schedule'
                          ? 'Najpierw utwórz i aktywuj konsultację.'
                          : 'Obecnie nie ma dostępnych kategorii.'}
                </p>
            )}
            <Form
                key={`${record?.id ?? 'new'}:${record?.updatedAt ?? ''}`}
                fields={fields}
                renderPreview={
                    name === 'banners'
                        ? (values, file) => (
                              <BannerPreview
                                  values={values}
                                  file={file}
                                  photoId={
                                      record?.photoId as number | undefined
                                  }
                              />
                          )
                        : undefined
                }
                initial={record ?? { status: 'draft', lans: ['UA'] }}
                file={
                    name === 'banners'
                        ? record
                            ? 'optional'
                            : 'required'
                        : undefined
                }
                label={record ? 'Zapisz zmiany' : 'Utwórz'}
                submit={async (values, file) => {
                    if (
                        name === 'schedule' &&
                        new Date(String(values.startsAt)) <= new Date()
                    )
                        throw new Error(
                            'Termin konsultacji musi przypadać w przyszłości.',
                        )
                    const payload = record
                        ? changedValues(fields, values, record)
                        : values
                    if (record && !Object.keys(payload).length && !file)
                        throw new Error('Nie wprowadzono żadnych zmian.')
                    let body: unknown = payload
                    if (name === 'banners') {
                        const data = new FormData()
                        Object.entries(payload).forEach(([key, value]) =>
                            data.append(key, String(value)),
                        )
                        if (file) data.append('file', file)
                        body = data
                    }
                    const result = record
                        ? await http.patch<Row>(
                              `${resource.edit}/${record.id}`,
                              body,
                          )
                        : await http.post<Row>(resource.create!, body)
                    await client.invalidateQueries({ queryKey: ['portal'] })
                    if (!record && result?.id)
                        router.push(`/main/${name}/${result.id}`)
                    return result
                }}
            />
        </section>
    )
}
