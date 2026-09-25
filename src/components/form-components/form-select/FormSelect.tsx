'use client'

import { useEffect, useId, useRef, useState } from 'react'
import c from './FormSelect.module.scss'

interface Props<T extends string | number | null> {
    options: readonly { title: string; value: T }[]
    item: T
    onChange: (value: T) => void
    selectTitle: string
    placeholder?: string
    disabled?: boolean
}

export default function FormSelect<T extends string | number | null>({
    options,
    item,
    onChange,
    selectTitle,
    placeholder = 'Wybierz',
    disabled,
}: Props<T>) {
    const [open, setOpen] = useState(false)

    const root = useRef<HTMLDivElement>(null)

    const trigger = useRef<HTMLButtonElement>(null)

    const id = useId()

    useEffect(() => {
        if (!open) return

        const close = (event: PointerEvent) => {
            if (!root.current?.contains(event.target as Node)) setOpen(false)
        }

        document.addEventListener('pointerdown', close)

        root.current
            ?.querySelector<HTMLButtonElement>(
                '[data-option][aria-selected="true"]',
            )
            ?.focus()

        return () => document.removeEventListener('pointerdown', close)
    }, [open])

    return (
        <div
            className={c.label}
            ref={root}
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                    setOpen(false)
            }}
            onKeyDown={(event) => {
                if (event.key === 'Escape') {
                    event.preventDefault()

                    event.stopPropagation()

                    setOpen(false)

                    trigger.current?.focus()
                }

                if (
                    ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)
                ) {
                    event.preventDefault()

                    if (!open) {
                        setOpen(true)

                        return
                    }

                    const buttons = Array.from(
                        root.current?.querySelectorAll<HTMLButtonElement>(
                            '[data-option]',
                        ) ?? [],
                    )

                    const index = buttons.indexOf(
                        document.activeElement as HTMLButtonElement,
                    )

                    const next =
                        event.key === 'Home'
                            ? 0
                            : event.key === 'End'
                              ? buttons.length - 1
                              : (index +
                                    (event.key === 'ArrowDown' ? 1 : -1) +
                                    buttons.length) %
                                buttons.length

                    buttons[next]?.focus()
                }
            }}
        >
            <span id={`${id}-label`}>{selectTitle}</span>
            <div className={c.select}>
                <button
                    ref={trigger}
                    type="button"
                    disabled={disabled}
                    aria-labelledby={`${id}-label ${id}-value`}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-controls={`${id}-list`}
                    className={c.select__trigger}
                    onClick={() => setOpen(!open)}
                >
                    <span id={`${id}-value`}>
                        {options.find((option) => option.value === item)
                            ?.title ?? placeholder}
                    </span>
                    <span className={c.arrow} />
                </button>
                {open && (
                    <div
                        id={`${id}-list`}
                        className={c.select__list}
                        role="listbox"
                        aria-labelledby={`${id}-label`}
                    >
                        {options.map((option, index) => (
                            <button
                                key={index}
                                type="button"
                                role="option"
                                data-option
                                aria-selected={option.value === item}
                                className={c.select__item}
                                onClick={() => {
                                    onChange(option.value)

                                    setOpen(false)

                                    trigger.current?.focus()
                                }}
                            >
                                {option.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
