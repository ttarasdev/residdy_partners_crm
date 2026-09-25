'use client'
import { useState } from 'react'
import FormFooter from '@/components/form-components/form-footer/FormFooter'
import { SchemaField } from '@/components/form-components/schema-field/SchemaField'
import { ErrorBox } from '@/components/ui/Common'
import s from './portal.module.scss'
import { warsawInput } from '../time'
import { serialize, type Field, type Values } from '../form-data'
export type { Field, Values } from '../form-data'
function initialValue(field: Field, value: unknown) {
    if (value === null || value === undefined) return ''
    if (field.type === 'datetime-local') return warsawInput(String(value))
    if (field.type === 'lines' && Array.isArray(value)) return value.join('\n')
    if (field.type === 'links' && typeof value === 'object')
        return Object.entries(value)
            .map(([key, v]) => `${key}=${v}`)
            .join('\n')
    return String(value)
}
export default function Form({
    fields,
    initial = {},
    submit,
    label = 'Zapisz zmiany',
    file,
    children,
    onSuccess,
    renderPreview,
}: {
    fields: Field[]
    initial?: object
    submit: (values: Values, file?: File) => Promise<unknown>
    label?: string
    file?: 'required' | 'optional'
    children?: React.ReactNode
    renderPreview?: (values: Values, file?: File) => React.ReactNode
    onSuccess?: (result: unknown) => void
}) {
    const [previewValues, setPreviewValues] = useState<Values>(
        initial as Values,
    )
    const [previewFile, setPreviewFile] = useState<File>()
    const [pending, setPending] = useState(false)
    const [error, setError] = useState<unknown>()
    const [done, setDone] = useState(false)
    async function handle(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setPending(true)
        setError(undefined)
        setDone(false)
        try {
            const data = new FormData(event.currentTarget)
            const values = serialize(fields, data)
            for (const field of fields) {
                const previous = (initial as Values)[field.name]
                if (
                    previous !== null &&
                    previous !== undefined &&
                    previous !== '' &&
                    data.has(field.name) &&
                    !String(data.get(field.name)).trim() &&
                    !field.allowEmpty &&
                    field.type !== 'multi'
                )
                    throw new Error(
                        `Pole „${field.label}” nie może być puste. Podaj nową wartość.`,
                    )
            }
            const image = data.get('file')
            const selected =
                image instanceof File && image.size ? image : undefined
            if (file === 'required' && !selected)
                throw new Error('Wybierz obraz.')
            if (
                selected &&
                (selected.size > 20 * 1024 * 1024 ||
                    !['image/jpeg', 'image/png', 'image/webp'].includes(
                        selected.type,
                    ))
            )
                throw new Error('Wybierz plik JPEG, PNG lub WebP do 20 MB.')
            const result = await submit(values, selected)
            setDone(true)
            onSuccess?.(result)
        } catch (e) {
            setError(e)
        } finally {
            setPending(false)
        }
    }
    return (
        <form className={s.form} onSubmit={handle}>
            <div className={s.fields}>
                {fields.map((f) => {
                    const value = (initial as Values)[f.name]
                    return f.type === 'multi' ? (
                        <fieldset
                            key={f.name}
                            className={`${s.field} ${s.full}`}
                            style={{ border: 0 }}
                        >
                            <legend>
                                {f.label}
                                {f.required ? ' *' : ''}
                            </legend>
                            <div className={s.checks}>
                                {f.options?.map((o) => (
                                    <label key={o.value}>
                                        <input
                                            type="checkbox"
                                            name={f.name}
                                            value={o.value}
                                            disabled={pending}
                                            defaultChecked={
                                                Array.isArray(value) &&
                                                value.includes(o.value)
                                            }
                                        />
                                        {o.label}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    ) : (
                        <div
                            key={f.name}
                            className={`${s.field} ${['textarea', 'lines', 'links'].includes(f.type ?? '') ? s.full : ''}`}
                        >
                            <SchemaField
                                field={f}
                                onValueChange={
                                    renderPreview
                                        ? (next) =>
                                              setPreviewValues((previous) => ({
                                                  ...previous,
                                                  [f.name]: next,
                                              }))
                                        : undefined
                                }
                                initial={initialValue(f, value)}
                                pending={pending}
                            />
                        </div>
                    )
                })}
            </div>
            {file && (
                <label className={s.field}>
                    Obraz{file === 'required' ? ' *' : ''}
                    <input
                        name="file"
                        onChange={(event) =>
                            setPreviewFile(event.target.files?.[0])
                        }
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        required={file === 'required'}
                        disabled={pending}
                    />
                    <small>JPEG, PNG lub WebP, do 20 MB.</small>
                </label>
            )}
            {renderPreview?.(previewValues, previewFile)}
            {children}
            {Boolean(error) && <ErrorBox error={error} />}
            {done && (
                <div className={s.success} role="status">
                    Zmiany zostały zapisane.
                </div>
            )}
            <FormFooter title={label} isPending={pending} />
        </form>
    )
}
