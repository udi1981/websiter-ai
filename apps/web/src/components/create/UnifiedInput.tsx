'use client'

import { useRef, useState, useEffect } from 'react'
import { TemplateInspiration, type TemplateItem } from './TemplateInspiration'

type UploadedFile = {
  name: string
  size: number
  type: 'image' | 'document'
  /** Extracted text content for documents */
  textContent?: string
  charCount: number
}

type ProcessingPhase = 'idle' | 'reading' | 'extracting' | 'analyzing' | 'done'

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
  onDocumentText?: (text: string | null) => void
  sourceOwnership?: 'self_owned' | 'third_party' | null
  onSourceOwnershipChange?: (value: 'self_owned' | 'third_party') => void
  scanMode?: 'copy' | 'inspiration' | null
  onScanModeChange?: (value: 'copy' | 'inspiration') => void
}

const ACCEPTED_DOC_EXTENSIONS = '.pdf,.docx,.doc,.txt,.csv,.html'
const MAX_IMAGE_SIZE = 5 * 1024 * 1024  // 5MB
const MAX_DOC_SIZE = 10 * 1024 * 1024   // 10MB

const PROCESSING_PHASES: { phase: ProcessingPhase; label: string; labelHe: string }[] = [
  { phase: 'reading', label: 'Reading file...', labelHe: 'קורא קובץ...' },
  { phase: 'extracting', label: 'Extracting content...', labelHe: 'מחלץ תוכן...' },
  { phase: 'analyzing', label: 'Analyzing for design insights...', labelHe: 'מנתח קו עיצובי...' },
  { phase: 'done', label: 'Document analyzed!', labelHe: 'המסמך נותח!' },
]

/** Extract text from a file client-side */
const extractTextFromFile = async (file: File): Promise<string> => {
  if (file.type.startsWith('text/')) {
    return file.text()
  }

  if (file.type === 'application/pdf') {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
    const textParts: string[] = []
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g
    let match
    while ((match = streamRegex.exec(text)) !== null) {
      const cleaned = match[1].replace(/[\x00-\x1f]/g, ' ').replace(/\s+/g, ' ').trim()
      if (cleaned.length > 10 && /[a-zA-Z\u0590-\u05FF]{3,}/.test(cleaned)) {
        textParts.push(cleaned)
      }
    }
    const tjRegex = /\(([^)]+)\)\s*Tj/g
    while ((match = tjRegex.exec(text)) !== null) {
      if (match[1].length > 2) textParts.push(match[1])
    }
    return textParts.join('\n').slice(0, 10000) || `[PDF: ${file.name}, ${(file.size / 1024).toFixed(0)}KB]`
  }

  if (file.type.includes('wordprocessingml') || file.type === 'application/msword') {
    try {
      const buffer = await file.arrayBuffer()
      const text = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(buffer))
      const textParts = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g)?.map(t => t.replace(/<[^>]+>/g, '')) || []
      return textParts.join(' ').slice(0, 10000) || `[Document: ${file.name}, ${(file.size / 1024).toFixed(0)}KB]`
    } catch {
      return `[Document: ${file.name}, ${(file.size / 1024).toFixed(0)}KB]`
    }
  }

  return `[File: ${file.name}]`
}

const getDocIcon = (name: string) => {
  if (name.endsWith('.pdf')) return '📄'
  if (name.endsWith('.docx') || name.endsWith('.doc')) return '📝'
  if (name.endsWith('.csv')) return '📊'
  if (name.endsWith('.txt')) return '📃'
  return '📎'
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
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
  onDocumentText,
  sourceOwnership,
  onSourceOwnershipChange,
  scanMode,
  onScanModeChange,
}: UnifiedInputProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const [uploadedDocs, setUploadedDocs] = useState<UploadedFile[]>([])
  const [processingPhase, setProcessingPhase] = useState<ProcessingPhase>('idle')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Auto-clear success message after 4 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  // Auto-clear "done" phase after 3 seconds
  useEffect(() => {
    if (processingPhase === 'done') {
      const timer = setTimeout(() => setProcessingPhase('idle'), 3000)
      return () => clearTimeout(timer)
    }
  }, [processingPhase])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_IMAGE_SIZE) return
    const reader = new FileReader()
    reader.onload = () => {
      onImageUpload(reader.result as string)
      setSuccessMessage(`✅ ${file.name} הועלה בהצלחה / uploaded successfully`)
    }
    reader.readAsDataURL(file)
  }

  const handleDocChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_DOC_SIZE) return

    // Phase 1: Reading
    setProcessingPhase('reading')

    try {
      // Phase 2: Extracting
      await new Promise(r => setTimeout(r, 400)) // Brief delay so user sees phase change
      setProcessingPhase('extracting')
      const textContent = await extractTextFromFile(file)

      // Phase 3: Analyzing
      setProcessingPhase('analyzing')
      await new Promise(r => setTimeout(r, 600)) // Simulate analysis time

      const newDoc: UploadedFile = {
        name: file.name,
        size: file.size,
        type: 'document',
        textContent,
        charCount: textContent.length,
      }

      setUploadedDocs(prev => {
        const updated = [...prev, newDoc]
        // Pass combined document text to parent
        const allText = updated.map(d => d.textContent).filter(Boolean).join('\n\n---\n\n')
        onDocumentText?.(allText || null)
        return updated
      })

      // Phase 4: Done
      setProcessingPhase('done')
      setSuccessMessage(`✅ ${file.name} — ${textContent.length.toLocaleString()} characters extracted`)

    } catch (err) {
      console.error('Document processing failed:', err)
      setProcessingPhase('idle')
      setSuccessMessage(`❌ Failed to process ${file.name}`)
    }

    // Reset file input so same file can be re-uploaded
    if (docInputRef.current) docInputRef.current.value = ''
  }

  const removeDoc = (index: number) => {
    setUploadedDocs(prev => {
      const updated = prev.filter((_, i) => i !== index)
      const allText = updated.map(d => d.textContent).filter(Boolean).join('\n\n---\n\n')
      onDocumentText?.(allText || null)
      return updated
    })
  }

  const canContinue = description.trim().length > 0 || selectedTemplateId !== null
  const currentPhaseInfo = PROCESSING_PHASES.find(p => p.phase === processingPhase)
  const isProcessing = processingPhase !== 'idle' && processingPhase !== 'done'

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 pt-6 sm:space-y-8 sm:px-0 sm:pt-0">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light sm:mb-4 sm:h-14 sm:w-14">
          <svg className="h-6 w-6 text-primary sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-text sm:text-2xl">Create Your Website</h1>
        <p className="mt-1.5 text-sm text-text-muted sm:mt-2">
          ספר לנו על העסק שלך ונבנה אתר מדהים / Tell us about your business
        </p>
      </div>

      {/* Main Input Card */}
      <div className="rounded-2xl border border-border bg-bg-secondary p-4 space-y-5 sm:p-6">
        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text">
            תאר את העסק שלך / Describe your business
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="למשל: בית קפה בוטיק בתל אביב המתמחה בפולי קפה מיוחדים, מאפים טריים ואווירת עבודה נעימה... / E.g., A boutique coffee shop in Tel Aviv..."
            className="w-full resize-none rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            rows={4}
          />
        </div>

        {/* URL Input */}
        <div>
          <label className="mb-2 block text-sm font-medium text-text">
            כתובת אתר להשראה / Inspiration URL
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

        {/* Scan Mode Selection — visible only when URL is entered */}
        {url.trim().length > 5 && onSourceOwnershipChange && onScanModeChange && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-text-muted">סוג סריקה:</span>
            <button
              type="button"
              onClick={() => { onSourceOwnershipChange('self_owned'); onScanModeChange('copy') }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                sourceOwnership === 'self_owned'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-bg-alt text-text-muted hover:bg-bg-alt/80 border border-border'
              }`}
            >
              🔄 שיבוט האתר שלי
            </button>
            <button
              type="button"
              onClick={() => { onSourceOwnershipChange('third_party'); onScanModeChange('inspiration') }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                sourceOwnership === 'third_party' || !sourceOwnership
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-bg-alt text-text-muted hover:bg-bg-alt/80 border border-border'
              }`}
            >
              ✨ השראה מאתר אחר
            </button>
          </div>
        )}

        {/* Upload Section — Images + Documents */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Image Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              לוגו או תמונת מותג / Logo or brand image
              <span className="ms-1 text-xs text-text-muted font-normal">(optional)</span>
            </label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {uploadedImage ? (
              <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/5 px-4 py-2.5 transition-all">
                <div className="relative">
                  <img src={uploadedImage} alt="Uploaded" className="h-10 w-10 rounded-lg object-cover" />
                  <div className="absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-success">
                    <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-xs font-medium text-success">תמונה הועלתה / Image uploaded</span>
                  <span className="block text-[10px] text-text-muted">ה-AI ישתמש בלוגו שלך</span>
                </div>
                <button
                  onClick={() => onImageUpload(null)}
                  className="rounded-lg p-1 text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border bg-bg px-4 py-2.5 text-sm text-text-muted hover:border-primary hover:text-primary transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
                העלה תמונה / Upload image
              </button>
            )}
          </div>

          {/* Document Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-text">
              מסמכים / Documents
              <span className="ms-1 text-xs text-text-muted font-normal">(PDF, DOCX, TXT)</span>
            </label>
            <input
              ref={docInputRef}
              type="file"
              accept={ACCEPTED_DOC_EXTENSIONS}
              onChange={handleDocChange}
              className="hidden"
            />

            {/* Uploaded docs list */}
            {uploadedDocs.length > 0 && (
              <div className="space-y-2 mb-2">
                {uploadedDocs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/5 px-3 py-2.5 transition-all">
                    <span className="text-lg">{getDocIcon(doc.name)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <svg className="h-3.5 w-3.5 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-medium text-text truncate">{doc.name}</span>
                      </div>
                      <span className="block text-[10px] text-text-muted mt-0.5">
                        {formatFileSize(doc.size)} · {doc.charCount.toLocaleString()} chars extracted
                      </span>
                    </div>
                    <button
                      onClick={() => removeDoc(i)}
                      className="rounded-lg p-1 text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Processing status */}
            {isProcessing && currentPhaseInfo && (
              <div className="flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5 mb-2 animate-pulse">
                <svg className="h-4 w-4 text-primary animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-xs font-medium text-primary">
                  {currentPhaseInfo.labelHe} / {currentPhaseInfo.label}
                </span>
              </div>
            )}

            {/* Done phase indicator */}
            {processingPhase === 'done' && currentPhaseInfo && (
              <div className="flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/5 px-3 py-2.5 mb-2">
                <svg className="h-4 w-4 text-success shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-medium text-success">
                  {currentPhaseInfo.labelHe} / {currentPhaseInfo.label}
                </span>
              </div>
            )}

            {/* Upload / Add more button */}
            <button
              onClick={() => docInputRef.current?.click()}
              disabled={isProcessing}
              className={`flex w-full items-center gap-2 rounded-xl border border-dashed px-4 py-2.5 text-sm transition-colors disabled:opacity-50 ${
                uploadedDocs.length > 0
                  ? 'border-border px-3 py-1.5 text-xs justify-center text-text-muted hover:border-primary hover:text-primary'
                  : 'border-border bg-bg text-text-muted hover:border-primary hover:text-primary'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              {uploadedDocs.length > 0 ? '+ הוסף מסמך / Add document' : 'העלה מסמך / Upload document'}
            </button>
          </div>
        </div>

        {/* Success toast */}
        {successMessage && (
          <div className="rounded-xl border border-success/30 bg-success/5 px-4 py-2.5 text-sm text-success font-medium animate-in fade-in slide-in-from-top-2 duration-300">
            {successMessage}
          </div>
        )}

        {/* Document hint */}
        {uploadedDocs.length === 0 && !successMessage && (
          <p className="text-[11px] text-text-muted -mt-2">
            העלה תוכן עסקי, מפרט מוצר, או חומרי שיווק — ה-AI ישתמש בהם לבניית האתר / Upload business docs to help AI build your site
          </p>
        )}

        {/* Upload summary when docs exist */}
        {uploadedDocs.length > 0 && !successMessage && (
          <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 -mt-2">
            <svg className="h-4 w-4 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span className="text-[11px] text-primary">
              {uploadedDocs.length} document{uploadedDocs.length > 1 ? 's' : ''} · {uploadedDocs.reduce((s, d) => s + d.charCount, 0).toLocaleString()} chars — AI will use this to build your site
            </span>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={onContinue}
          disabled={!canContinue || isDisabled}
          className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-hover px-6 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-primary/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isDisabled ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              ...מעבד / Processing
            </span>
          ) : (
            'המשך → / Continue →'
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
