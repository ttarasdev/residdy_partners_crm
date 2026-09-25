'use client'

import { useId, type InputHTMLAttributes } from 'react'
import c from './TextInput.module.scss'

interface Props
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    inputTitle: string
    value: string | null
    onChange: (value: string) => void
}

export default function TextInput({
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
            <input
                type="text"
                {...props}
                id={fieldId}
                className={c.input}
                value={value ?? ''}
                onChange={(event) => onChange(event.target.value)}
            />
        </label>
    )
}
