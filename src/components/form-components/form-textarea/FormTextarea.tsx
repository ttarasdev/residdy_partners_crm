'use client'

import { useId, type TextareaHTMLAttributes } from 'react'
import c from './FormTextarea.module.scss'

interface Props
    extends Omit<
        TextareaHTMLAttributes<HTMLTextAreaElement>,
        'value' | 'onChange'
    > {
    inputTitle: string
    value: string | null
    onChange: (value: string) => void
}

export default function FormTextarea({
    inputTitle,
    value,
    onChange,
    id,
    ...props
}: Props) {
    const generatedId = useId()

    const fieldId = id ?? generatedId

    return (
        <label className={c.label} htmlFor={fieldId}>
            {inputTitle}
            <textarea
                {...props}
                id={fieldId}
                className={c.textarea}
                value={value ?? ''}
                onChange={(event) => onChange(event.target.value)}
            />
        </label>
    )
}
