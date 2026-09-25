'use client'
import Link from 'next/link'
import { useQueries } from '@tanstack/react-query'
import { ArrowUpRight, Handshake, CalendarDays } from 'lucide-react'
import { list } from '@/api/portal'
import { useAuth } from '@/shared/hooks/useAuth'
import { navigation } from '../config'
import s from './dashboard.module.scss'
export default function Overview() {
    const { session } = useAuth()
    const { role, profile, account } = session!
    const partner = role === 'PARTNERS'
    const metrics = partner
        ? [
              {
                  title: 'Moje firmy',
                  path: '/partner-companies/my',
                  filter: {},
                  href: 'companies',
                  note: 'Wszystkie dostępne firmy',
              },
              {
                  title: 'Opublikowane firmy',
                  path: '/partner-companies/my',
                  filter: { status: 'active' },
                  href: 'companies',
                  note: 'Dostępne dla klientów Residdy',
              },
              {
                  title: 'Aktywne banery',
                  path: '/partner-banners/my',
                  filter: { status: 'active' },
                  href: 'banners',
                  note: 'Wyświetlane kampanie reklamowe',
              },
          ]
        : [
              {
                  title: 'Opłacone rezerwacje',
                  path: '/consultation-bookings/specialist/my',
                  filter: { status: 'paid' },
                  href: 'bookings',
                  note: 'Rezerwacje ze statusem „Opłacono”',
              },
              {
                  title: 'Aktywne konsultacje',
                  path: '/specialist-consultations/my',
                  filter: { status: 'active' },
                  href: 'consultations',
                  note: 'Usługi dostępne do rezerwacji',
              },
              {
                  title: 'Opublikowane opinie',
                  path: `/consultation-reviews/specialist/${profile.id}`,
                  filter: {},
                  href: 'reviews',
                  note: 'Opinie klientów',
              },
          ]
    const queries = useQueries({
        queries: metrics.map((m) => ({
            queryKey: ['portal', account.id, 'metric', m.path, m.filter],
            queryFn: ({ signal }: { signal: AbortSignal }) =>
                list(m.path, { ...m.filter, limit: 1 }, signal),
        })),
    })
    return (
        <div className={s.page}>
            <header className={s.header}>
                <p className={s.eyebrow}>RESIDDY WORKFLOW</p>
                <h1>Witaj{profile.name ? `, ${profile.name}` : ''}!</h1>
                <p>Wszystko, czego potrzebujesz do pracy, w jednym miejscu.</p>
            </header>
            <div className={s.stats}>
                {metrics.map((metric, i) => (
                    <Link
                        href={`/main/${metric.href}`}
                        key={metric.title}
                        className={s.stat}
                    >
                        <div>
                            {partner ? (
                                <Handshake size={18} />
                            ) : (
                                <CalendarDays size={18} />
                            )}
                            <ArrowUpRight size={15} />
                        </div>
                        <strong>
                            {queries[i].isPending
                                ? '…'
                                : queries[i].isError
                                  ? '—'
                                  : queries[i].data?.total}
                        </strong>
                        <span>{metric.title}</span>
                        {queries[i].error && <small>Dane niedostępne</small>}
                    </Link>
                ))}
            </div>
            <section>
                <div className={s.sectionHeader}>
                    <h2>Przestrzeń robocza</h2>
                    <span>{navigation[role].length} dostępnych modułów</span>
                </div>
                <div className={s.modules}>
                    {navigation[role].map((item) => (
                        <Link
                            href={`/main/${item.slug}`}
                            key={item.slug}
                            className={s.module}
                        >
                            <div>
                                <span className={s.tag}>
                                    {partner ? 'Partnerzy' : 'Konsultacje'}
                                </span>
                                <ArrowUpRight size={17} />
                            </div>
                            <h3>{item.label}</h3>
                            <p>{item.description}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    )
}
