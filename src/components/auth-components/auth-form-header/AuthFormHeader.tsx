import c from './AuthFormHeader.module.scss'

export function AuthFormHeader({
    title,
    subtitle,
}: {
    title: string
    subtitle?: string
}) {
    return (
        <header className={c.header}>
            <h1 className={c.header__title}>{title}</h1>
            {subtitle && <p className={c.header__subtitle}>{subtitle}</p>}
        </header>
    )
}
