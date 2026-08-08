import { Controller } from 'react-hook-form'
import { Field } from './field'
import { Input, Textarea, Select } from './input'
import { cn } from '../../lib/utils'

export function FormField({
  control,
  name,
  label,
  required,
  hint,
  className,
  children,
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          label={label}
          htmlFor={name}
          required={required}
          hint={hint}
          error={fieldState.error?.message}
          className={className}
        >
          {typeof children === 'function' ? children(field, fieldState) : children}
        </Field>
      )}
    />
  )
}

export function FormInput({
  control,
  name,
  label,
  required,
  hint,
  className,
  fieldClassName,
  ...props
}) {
  return (
    <FormField control={control} name={name} label={label} required={required} hint={hint} className={className}>
      {({ field, fieldState }) => (
        <Input
          id={name}
          {...field}
          value={field.value ?? ''}
          invalid={!!fieldState.error}
          className={fieldClassName}
          {...props}
        />
      )}
    </FormField>
  )
}

export function FormTextarea({
  control,
  name,
  label,
  required,
  hint,
  className,
  fieldClassName,
  ...props
}) {
  return (
    <FormField control={control} name={name} label={label} required={required} hint={hint} className={className}>
      {({ field, fieldState }) => (
        <Textarea
          id={name}
          {...field}
          value={field.value ?? ''}
          invalid={!!fieldState.error}
          className={fieldClassName}
          {...props}
        />
      )}
    </FormField>
  )
}

export function FormSelect({
  control,
  name,
  label,
  required,
  hint,
  options,
  className,
  fieldClassName,
  placeholder,
  ...props
}) {
  return (
    <FormField control={control} name={name} label={label} required={required} hint={hint} className={className}>
      {({ field, fieldState }) => (
        <Select
          id={name}
          {...field}
          value={field.value ?? ''}
          invalid={!!fieldState.error}
          className={fieldClassName}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options?.map((opt) => {
            const { value, label: optLabel, disabled } =
              typeof opt === 'string' ? { value: opt, label: opt, disabled: false } : opt
            return (
              <option key={value} value={value} disabled={disabled}>
                {optLabel}
              </option>
            )
          })}
        </Select>
      )}
    </FormField>
  )
}

export function FormCheckbox({ control, name, label, description, className, ...props }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn('space-y-1', className)}>
          <label htmlFor={name} className="flex cursor-pointer items-start gap-2.5">
            <input
              id={name}
              type="checkbox"
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              className="mt-0.5 size-4 rounded border-border accent-brand-600"
              {...props}
            />
            <span>
              <span className="block text-sm font-medium text-foreground">{label}</span>
              {description && <span className="block text-xs text-muted-foreground">{description}</span>}
            </span>
          </label>
          {fieldState.error?.message && (
            <p className="pl-6 text-xs font-medium text-danger-600">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}

export function FormFieldset({ legend, children, className }) {
  return (
    <fieldset className={cn('space-y-4', className)}>
      {legend && <legend className="text-sm font-semibold text-foreground">{legend}</legend>}
      {children}
    </fieldset>
  )
}

export function FormSection({ title, description, children, className }) {
  return (
    <div className={cn('space-y-4 rounded-2xl border border-border bg-surface p-5', className)}>
      {(title || description) && (
        <div>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
