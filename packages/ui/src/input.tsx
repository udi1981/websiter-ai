import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1.5">{label}</label>
      )}
      <input
        className={`w-full rounded-lg border bg-bg px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1 ${
          error
            ? 'border-error focus:border-error focus:ring-error'
            : 'border-border focus:border-primary focus:ring-primary'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
}
