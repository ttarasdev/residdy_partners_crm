import type { ReactNode } from 'react'
import c from './Page.module.scss'

export function Page({
    title,
    children,
}: {
    title: string
    children?: ReactNode
}) {
    return (
        <section className={c.page}>
            <h1 className={c.title}>{title}</h1>
            {children}
        </section>
    )
}
