'use client'

import { useRef, useEffect, useCallback } from 'react'

type PreviewMode = 'desktop' | 'tablet' | 'mobile'

type EditorPreviewProps = {
  previewMode: PreviewMode
  htmlContent: string
  selectMode: boolean
  onElementSelected: (info: { tag: string; text: string; classList: string }) => void
}

const previewWidthValues: Record<PreviewMode, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
}

/** Inject a selection script into the HTML for "Select to Edit" mode */
const injectSelectionScript = (html: string, selectMode: boolean): string => {
  if (!selectMode) return html

  const script = `
<script>
(function() {
  let hoveredEl = null;
  document.addEventListener('mouseover', function(e) {
    if (hoveredEl) {
      hoveredEl.style.outline = '';
      hoveredEl.style.outlineOffset = '';
    }
    hoveredEl = e.target;
    if (hoveredEl && hoveredEl !== document.body && hoveredEl !== document.documentElement) {
      hoveredEl.style.outline = '2px solid #7C3AED';
      hoveredEl.style.outlineOffset = '-1px';
    }
  });
  document.addEventListener('mouseout', function(e) {
    if (hoveredEl) {
      hoveredEl.style.outline = '';
      hoveredEl.style.outlineOffset = '';
      hoveredEl = null;
    }
  });
  document.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var el = e.target;
    if (!el) return;
    window.parent.postMessage({
      type: 'ELEMENT_SELECTED',
      payload: {
        tag: el.tagName.toLowerCase(),
        text: el.textContent ? el.textContent.substring(0, 200) : '',
        classList: el.className || '',
        id: el.id || '',
        outerHTML: el.outerHTML ? el.outerHTML.substring(0, 500) : ''
      }
    }, '*');
  }, true);
})();
</script>`

  // Insert before closing body
  if (html.includes('</body>')) {
    return html.replace('</body>', `${script}\n</body>`)
  }
  return html + script
}

/** Center panel that renders the website HTML in an iframe */
export const EditorPreview = ({
  previewMode,
  htmlContent,
  selectMode,
  onElementSelected,
}: EditorPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Write HTML content to iframe
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    // If htmlContent is empty or too short, show a placeholder
    const content = htmlContent && htmlContent.trim().length > 50
      ? htmlContent
      : `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui;color:#888;background:#fafafa;"><div style="text-align:center"><p style="font-size:18px;margin-bottom:8px;">No content yet</p><p style="font-size:14px;">Use the AI chat to generate or modify your site</p></div></body></html>`

    const finalHtml = injectSelectionScript(content, selectMode)

    try {
      const doc = iframe.contentDocument
      if (doc) {
        doc.open()
        doc.write(finalHtml)
        doc.close()
      } else {
        // Fallback: use srcdoc
        console.warn('[EditorPreview] contentDocument unavailable, using srcdoc')
        iframe.srcdoc = finalHtml
      }
    } catch (err) {
      console.error('[EditorPreview] Failed to write to iframe:', err)
      // Fallback: use srcdoc
      iframe.srcdoc = finalHtml
    }
  }, [htmlContent, selectMode])

  // Listen for messages from iframe
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.data?.type === 'ELEMENT_SELECTED') {
        onElementSelected(event.data.payload)
      }
    },
    [onElementSelected]
  )

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  const width = previewWidthValues[previewMode]
  const isResponsive = previewMode !== 'desktop'

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-bg-tertiary">
      {/* Breadcrumb bar */}
      <div className="flex h-9 items-center justify-between border-b border-border bg-bg px-3">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Canvas</span>
          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-text">
            {previewMode.charAt(0).toUpperCase() + previewMode.slice(1)} ({width})
          </span>
          {selectMode && (
            <span className="ms-2 rounded bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary">
              Select Mode
            </span>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="relative flex-1 overflow-auto p-4">
        <div
          className="mx-auto h-full transition-all duration-300"
          style={{
            width: isResponsive ? width : '100%',
            maxWidth: '100%',
          }}
        >
          <div
            className={`h-full bg-white overflow-hidden ${
              isResponsive
                ? previewMode === 'mobile'
                  ? 'rounded-[2rem] border-[10px] border-gray-800 shadow-xl'
                  : 'rounded-2xl border-[8px] border-gray-800 shadow-xl'
                : ''
            }`}
          >
            <iframe
              ref={iframeRef}
              title="Site Preview"
              className="h-full w-full border-0"
              sandbox="allow-scripts allow-same-origin"
              style={{
                cursor: selectMode ? 'crosshair' : 'default',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
