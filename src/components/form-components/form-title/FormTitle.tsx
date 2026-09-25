import c from './FormTitle.module.scss'

export default function FormTitle({
    title,
    id,
}: {
    title: string
    id?: string
}) {
    return (
        <h2 id={id} className={c.title}>
            {title}
        </h2>
    )
}
