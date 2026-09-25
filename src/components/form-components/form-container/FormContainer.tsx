'use client'

import { useId, type FormHTMLAttributes, type ReactNode } from 'react'
import FormTitle from '../form-title/FormTitle'
import FormFooter from '../form-footer/FormFooter'
import c from './FormContainer.module.scss'

interface Props extends Omit<FormHTMLAttributes<HTMLFormElement>, 'title'> {
    title: string
    children: ReactNode
    error?: string | null
    isPending?: boolean
    submitTitle?: string
    onCancel?: () => void
}

export default function FormContainer({
    title,
    children,
    error,
    isPending = false,
    submitTitle,
    onCancel,
    className = '',
    onSubmit,
    ...props
}: Props) {
    const titleId = useId()

    return (
        <form
            {...props}
            aria-labelledby={titleId}
            aria-busy={isPending}
            className={`${c.form} ${className}`}
            onSubmit={(event) => {
                event.preventDefault()

                if (!isPending) onSubmit?.(event)
            }}
        >
            <FormTitle title={title} id={titleId} />
            <fieldset disabled={isPending} className={c.fields}>
                {children}
            </fieldset>
            {error && (
                <p className={c.error} role="alert">
                    {error}
                </p>
            )}
            <FormFooter
                title={submitTitle}
                onCancel={onCancel}
                isPending={isPending}
            />
        </form>
    )
}
