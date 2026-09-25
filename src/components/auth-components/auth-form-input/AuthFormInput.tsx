'use client'

import { useId, type InputHTMLAttributes } from 'react'
import { ThemedIcon } from '../../theme-components/themed-icon/ThemedIcon'
import c from './AuthFormInput.module.scss'

interface Props
    extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    labelTitle: string
    iconPath: string
    onChange: (value: string) => void
}

export function AuthFormInput({
    labelTitle,
    iconPath,
    onChange,
    id,
    ...props
}: Props) {
    const generatedId = useId()

    const inputId = id ?? generatedId

    return (
        <div className={c.input__container}>
            <div className={c.input__box}>
                <ThemedIcon path={iconPath} width={25} height={25} />
            </div>
            <span className={c.input__branch} aria-hidden="true" />
            <div className={c.input__body}>
                <label htmlFor={inputId}>{labelTitle}</label>
                <input
                    {...props}
                    id={inputId}
                    onChange={(event) => onChange(event.target.value)}
                />
            </div>
        </div>
    )
}
