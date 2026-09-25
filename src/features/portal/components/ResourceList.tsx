'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { list } from '@/api/portal'
import { useAuth } from '@/shared/hooks/useAuth'
import {
    Badge,
    Button,
    Loading,
    Failure,
    Empty,
    Pagination,
} from '@/components/ui/Common'
import { resources, valueAt, type ResourceName } from '../resources'
import { statuses } from '../config'
import { monday, addDays, dayKey, dateTime } from '../time'
import s from './portal.module.scss'
export type Row = { id: number; [key: string]: unknown }
export function Cell({
    row,
    column,
}: {
    row: Row
    column: { key: string; kind?: string }
}) {
    const value = valueAt(row, column.key)
    if (value === undefined || value === null || value === '') return <>—</>
    if (column.kind === 'status') return <Badge status={String(value)} />
    if (column.kind === 'date') return <>{dateTime(String(value))}</>
    if (column.kind === 'money')
        return (
            <>
                {new Intl.NumberFormat('pl-PL', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(Number(value))}
            </>
        )
    return <>{String(value)}</>
}
export default function ResourceList({ name }: { name: ResourceName }) {
    const { session } = useAuth()
    const resource = resources[name]
    const [page, setPage] = useState(1)
    const [status, setStatus] = useState('')
    const [search, setSearch] = useState('')
    const [week, setWeek] = useState(monday)
    const [view, setView] = useState<'calendar' | 'list'>('calendar')
    const path =
        name === 'reviews'
            ? `${resource.list}/${session!.profile.id}`
            : resource.list
    const params = {
        page,
        limit: 20,
        ...(status ? { status } : {}),
        ...(name === 'schedule' ? { weekStart: week } : {}),
        ...(name === 'companies' && search ? { companyName: search } : {}),
    }
    const query = useQuery({
        queryKey: ['portal', session!.account.id, name, params],
        queryFn: ({ signal }) => list<Row>(path, params, signal),
    })
    function changeWeek(n: number) {
        setWeek(addDays(week, n))
        setPage(1)
    }
    return (
        <>
            <div className={s.heading}>
                <div>
                    <h1>{resource.title}</h1>
                    <p>{resource.description}</p>
                </div>
                {resource.create && (
                    <Link className={s.button} href={`/main/${name}/new`}>
                        <Plus size={16} />
                        {name === 'schedule' ? 'Dodaj termin' : 'Utwórz'}
                    </Link>
                )}
            </div>
            {(resource.statuses ||
                name === 'companies' ||
                name === 'schedule') && (
                <div className={s.toolbar}>
                    {resource.statuses && (
                        <label className={s.field}>
                            Status
                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value)
                                    setPage(1)
                                }}
                            >
                                <option value="">Wszystkie statusy</option>
                                {resource.statuses.map((v) => (
                                    <option key={v} value={v}>
                                        {statuses[v]}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                    {name === 'companies' && (
                        <label className={s.field}>
                            Szukaj po nazwie
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setPage(1)
                                }}
                                placeholder="Nazwa firmy"
                            />
                        </label>
                    )}
                    {name === 'schedule' && (
                        <>
                            <Button
                                secondary
                                onClick={() => changeWeek(-7)}
                                aria-label="Poprzedni tydzień"
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <label className={s.field}>
                                Początek tygodnia
                                <input
                                    type="date"
                                    value={week}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            setWeek(e.target.value)
                                            setPage(1)
                                        }
                                    }}
                                />
                            </label>
                            <Button
                                secondary
                                onClick={() => changeWeek(7)}
                                aria-label="Następny tydzień"
                            >
                                <ChevronRight size={16} />
                            </Button>
                            <Button
                                secondary
                                onClick={() => {
                                    setWeek(monday())
                                    setPage(1)
                                }}
                            >
                                Ten tydzień
                            </Button>
                            <Button
                                secondary
                                onClick={() =>
                                    setView(
                                        view === 'calendar'
                                            ? 'list'
                                            : 'calendar',
                                    )
                                }
                            >
                                {view === 'calendar' ? 'Lista' : 'Kalendarz'}
                            </Button>
                        </>
                    )}
                </div>
            )}
            {query.isPending ? (
                <Loading />
            ) : query.isError ? (
                <Failure
                    error={query.error}
                    retry={() => void query.refetch()}
                />
            ) : (
                <>
                    {query.data.rows.length === 0 ? (
                        <Empty
                            text={
                                name === 'schedule'
                                    ? 'Brak terminów w wybranym tygodniu. Dodaj termin aktywnej konsultacji.'
                                    : 'Brak wyników dla wybranych kryteriów.'
                            }
                        />
                    ) : name === 'schedule' && view === 'calendar' ? (
                        <>
                            <div className={s.notice}>
                                Kalendarz pokazuje rekordy z bieżącej strony.
                                Przejdź na kolejne strony, aby zobaczyć cały
                                tydzień.
                            </div>
                            <div className={s.calendar}>
                                {Array.from({ length: 7 }, (_, i) => {
                                    const date = addDays(week, i)
                                    const rows = query.data.rows.filter(
                                        (row) =>
                                            dayKey(
                                                new Date(String(row.startsAt)),
                                            ) === date,
                                    )
                                    return (
                                        <section key={date} className={s.day}>
                                            <h3>
                                                {new Intl.DateTimeFormat(
                                                    'pl-PL',
                                                    {
                                                        timeZone: 'UTC',
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short',
                                                    },
                                                ).format(
                                                    new Date(
                                                        date + 'T12:00:00Z',
                                                    ),
                                                )}
                                            </h3>
                                            {rows.map((row) => (
                                                <Link
                                                    href={`/main/schedule/${row.id}`}
                                                    key={row.id}
                                                >
                                                    <strong>
                                                        {new Intl.DateTimeFormat(
                                                            'pl-PL',
                                                            {
                                                                timeZone:
                                                                    'Europe/Warsaw',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            },
                                                        ).format(
                                                            new Date(
                                                                String(
                                                                    row.startsAt,
                                                                ),
                                                            ),
                                                        )}
                                                    </strong>
                                                    <span>
                                                        {String(
                                                            valueAt(
                                                                row,
                                                                'specialistConsultation.titlePl',
                                                            ) ??
                                                                `Termin #${row.id}`,
                                                        )}
                                                    </span>
                                                    <Badge
                                                        status={String(
                                                            row.status,
                                                        )}
                                                    />
                                                </Link>
                                            ))}
                                        </section>
                                    )
                                })}
                            </div>
                        </>
                    ) : name === 'reviews' ? (
                        <div className={s.stack}>
                            {query.data.rows.map((row) => (
                                <article className={s.card} key={row.id}>
                                    <div className={s.between}>
                                        <strong>
                                            {String(
                                                valueAt(row, 'user.name') ??
                                                    'Klient',
                                            )}
                                        </strong>
                                        <span
                                            aria-label={`Ocena ${row.rating} na 5`}
                                        >
                                            {'★'.repeat(
                                                Math.max(
                                                    0,
                                                    Math.min(
                                                        5,
                                                        Number(row.rating),
                                                    ),
                                                ),
                                            )}{' '}
                                            · {String(row.rating)}/5
                                        </span>
                                    </div>
                                    <p
                                        style={{
                                            whiteSpace: 'pre-wrap',
                                            margin: '16px 0',
                                        }}
                                    >
                                        {String(row.comment ?? '')}
                                    </p>
                                    <small className={s.muted}>
                                        {dateTime(String(row.createdAt))}
                                    </small>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className={s.tableWrap}>
                            <table className={s.table}>
                                <thead>
                                    <tr>
                                        {resource.columns.map((c) => (
                                            <th key={c.key}>{c.label}</th>
                                        ))}
                                        {resource.detail && (
                                            <th>
                                                <span className={s.muted}>
                                                    Szczegóły
                                                </span>
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {query.data.rows.map((row) => (
                                        <tr key={row.id}>
                                            {resource.columns.map(
                                                (column, i) => (
                                                    <td key={column.key}>
                                                        {i === 0 &&
                                                        resource.detail ? (
                                                            <Link
                                                                href={`/main/${name}/${row.id}`}
                                                            >
                                                                <Cell
                                                                    row={row}
                                                                    column={
                                                                        column
                                                                    }
                                                                />
                                                            </Link>
                                                        ) : (
                                                            <Cell
                                                                row={row}
                                                                column={column}
                                                            />
                                                        )}
                                                    </td>
                                                ),
                                            )}
                                            {resource.detail && (
                                                <td>
                                                    <Link
                                                        href={`/main/${name}/${row.id}`}
                                                        aria-label={`Otwórz rekord ${row.id}`}
                                                    >
                                                        Otwórz →
                                                    </Link>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pagination
                        page={page}
                        total={query.data.total}
                        onChange={setPage}
                    />
                </>
            )}
        </>
    )
}
