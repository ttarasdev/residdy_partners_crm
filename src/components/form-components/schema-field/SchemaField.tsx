'use client'
import { useState } from 'react'
import TextInput from '../text-input/TextInput'
import FormTextarea from '../form-textarea/FormTextarea'
import FormSelect from '../form-select/FormSelect'
import type { Field } from '@/features/portal/form-data'
export function SchemaField({
    field,
    initial,
    pending,
    onValueChange,
}: {
    field: Field
    initial: string
    pending: boolean
    onValueChange?: (value: string) => void
}) {
    const [value, setValue] = useState(initial)
    const change = (next: string) => {
        setValue(next)
        onValueChange?.(next)
    }
    const title = field.label + (field.required ? ' *' : '')
    const props = {
        name: field.name,
        required: field.required,
        disabled: pending,
        value,
        onChange: change,
        maxLength: field.maxLength,
    }
    return (
        <>
            {field.type === 'select' ? (
                <>
                    <FormSelect
                        selectTitle={title}
                        item={value}
                        options={(field.options ?? []).map((o) => ({
                            title: o.label,
                            value: o.value,
                        }))}
                        onChange={change}
                        placeholder="Wybierz…"
                        disabled={pending}
                    />
                    <input type="hidden" name={field.name} value={value} />
                </>
            ) : ['textarea', 'lines', 'links'].includes(field.type ?? '') ? (
                <FormTextarea {...props} inputTitle={title} rows={4} />
            ) : (
                <TextInput
                    {...props}
                    inputTitle={title}
                    type={field.type ?? 'text'}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    pattern={field.pattern}
                    autoComplete={
                        field.type === 'password' ? 'new-password' : undefined
                    }
                />
            )}
            {field.hint && <small>{field.hint}</small>}
        </>
    )
}
