'use client'
import Link from 'next/link'
import { useAuth } from '@/shared/hooks/useAuth'
import { canAccess } from '../config'
import { isResource, resources } from '../resources'
import ResourceList from './ResourceList'
import ResourceDetail from './ResourceDetail'
import Overview from './Overview'
import Profile from './Profile'
import Security from './Security'
import Editor from './Editor'
import s from './portal.module.scss'
function PortalContent({ segments }: { segments: string[] }) {
    const { session } = useAuth()
    if (!session) return null
    const [section = 'overview', id] = segments
    const invalid =
        segments.length > 2 ||
        !canAccess(session.role, section) ||
        (id && !isResource(section)) ||
        (id && isResource(section) && !resources[section].detail) ||
        (id === 'new' && isResource(section) && !resources[section].create) ||
        (id &&
            id !== 'new' &&
            (!/^[1-9]\d*$/.test(id) || Number(id) > 2147483647))
    if (invalid)
        return (
            <div className={s.state}>
                <h1>Strona niedostępna</h1>
                <p>
                    Ta sekcja nie jest dostępna w Twoim panelu lub adres jest
                    nieprawidłowy.
                </p>
                <Link href="/main" className={s.button}>
                    Strona główna
                </Link>
            </div>
        )
    if (section === 'overview') return <Overview />
    if (section === 'profile') return <Profile />
    if (section === 'security') return <Security />
    if (isResource(section)) {
        if (id === 'new')
            return (
                <>
                    <Link href={`/main/${section}`} className={s.back}>
                        ← {resources[section].title}
                    </Link>
                    <div className={s.heading}>
                        <div>
                            <h1>{resources[section].singular}: tworzenie</h1>
                            <p>
                                Uzupełnij dane. Pola oznaczone gwiazdką są
                                wymagane.
                            </p>
                        </div>
                    </div>
                    <Editor name={section} />
                </>
            )
        if (id) return <ResourceDetail name={section} id={Number(id)} />
        return <ResourceList name={section} />
    }
    return null
}

export default function PortalRouter({ segments }: { segments: string[] }) {
    return segments.length === 0 ||
        (segments.length === 1 && segments[0] === 'overview') ? (
        <PortalContent segments={segments} />
    ) : (
        <div className={s.page}>
            <PortalContent segments={segments} />
        </div>
    )
}
