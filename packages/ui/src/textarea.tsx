import type { TextareaHTMLAttributes } from 'react'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
}

/** Multi-line text input with optional label and error display */
export const Textarea = ({ label, error, className = '', rows = 4, ...props }: TextareaProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1.5">{label}</label>
      )}
      <textarea
        rows={rows}
        className={`w-full rounded-lg border bg-bg px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-1 resize-y ${
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
