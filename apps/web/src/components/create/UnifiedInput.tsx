'use client'

import { useRef } from 'react'
import { TemplateInspiration, type TemplateItem } from './TemplateInspiration'

type UnifiedInputProps = {
  description: string
  onDescriptionChange: (value: string) => void
  url: string
  onUrlChange: (value: string) => void
  uploadedImage: string | null
  onImageUpload: (dataUrl: string | null) => void
  selectedTemplateId: string | null
  onTemplateSelect: (template: TemplateItem) => void
  onContinue: () => void
  isDisabled: boolean
}

export const UnifiedInput = ({
  description,
  onDescriptionChange,
  url,
  onUrlChange,
  uploadedImage,
  onImageUpload,
  selectedTemplateId,
  onTemplateSelect,
  onContinue,
  isDisabled,
}: UnifiedInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return // 5MB limit
    const reader = new FileReader()
    reader.onload = () => onImageUpload(reader.result as string)
    reader.readAsDataURL(file)
  }

  const canContinue = description.trim().length > 0 || selectedTemplateId !== null

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light">
          <svg className="h-7 w-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text">Create Your Website</h1>
        <p className="mt-2 text-sm text-text-muted">
          Tell us about your business and we will build a stunning website tailored to your needs.
        </p>
      </div>

      {/* Main Input Card */}
      <div className="rounded-2xl border border-border bg-bg-secondary p-6 space-y-5">
        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text">
            Describe your business
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="E.g., A boutique coffee shop in Tel Aviv specializing in single-origin beans, light pastries, and a cozy work-from-cafe atmosphere..."
            className="w-full resize-none rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            rows={4}
          />
        </div>

        {/* URL + Image row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* URL */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Inspiration URL
              <span className="ms-1 text-xs text-text-muted font-normal">(optional)</span>
            </label>
            <div className="relative">
              <svg className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
              <input
                type="url"
                value={url}
                onChange={(e) => onUrlChange(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-border bg-bg px-4 py-2.5 ps-9 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              Logo or brand image
              <span className="ms-1 text-xs text-text-muted font-normal">(optional)</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {uploadedImage ? (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-bg px-4 py-2">
                <img src={uploadedImage} alt="Uploaded" className="h-8 w-8 rounded-md object-cover" />
                <span className="flex-1 truncate text-xs text-text-secondary">Image uploaded</span>
                <button
                  onClick={() => onImageUpload(null)}
                  className="text-xs text-text-muted hover:text-error transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border bg-bg px-4 py-2.5 text-sm text-text-muted hover:border-primary hover:text-primary transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Upload image
              </button>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          disabled={!canContinue || isDisabled}
          className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isDisabled ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </span>
          ) : (
            'Continue →'
          )}
        </button>
      </div>

      {/* Template Inspiration */}
      <TemplateInspiration
        selectedId={selectedTemplateId}
        onSelect={onTemplateSelect}
      />
    </div>
  )
}
