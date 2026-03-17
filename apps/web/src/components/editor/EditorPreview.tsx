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

  if (html.includes('</body>')) {
    return html.replace('</body>', `${script}\n</body>`)
  }
  return html + script
}

/** Center panel that renders the website HTML in an iframe — full canvas experience */
export const EditorPreview = ({
  previewMode,
  htmlContent,
  selectMode,
  onElementSelected,
}: EditorPreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

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
        console.warn('[EditorPreview] contentDocument unavailable, using srcdoc')
        iframe.srcdoc = finalHtml
      }
    } catch (err) {
      console.error('[EditorPreview] Failed to write to iframe:', err)
      iframe.srcdoc = finalHtml
    }
  }, [htmlContent, selectMode])

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
    <div className="flex flex-1 flex-col overflow-hidden bg-[#161b22]">
      {/* Preview Area — no breadcrumb, maximum canvas */}
      <div className="relative flex-1 overflow-auto">
        <div
          className={`mx-auto h-full transition-all duration-300 ${isResponsive ? 'py-6' : ''}`}
          style={{
            width: isResponsive ? width : '100%',
            maxWidth: '100%',
          }}
        >
          <div
            className={`h-full overflow-hidden ${
              isResponsive
                ? previewMode === 'mobile'
                  ? 'rounded-[2.5rem] border-[10px] border-[#2d333b] shadow-2xl shadow-black/40 mx-auto'
                  : 'rounded-2xl border-[8px] border-[#2d333b] shadow-2xl shadow-black/40 mx-auto'
                : ''
            }`}
          >
            <iframe
              ref={iframeRef}
              title="Site Preview"
              className="h-full w-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin"
              style={{
                cursor: selectMode ? 'crosshair' : 'default',
              }}
            />
          </div>
        </div>

        {/* Select mode indicator */}
        {selectMode && (
          <div className="absolute top-3 start-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-2 rounded-full bg-violet-600/90 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-white shadow-lg shadow-violet-500/30">
              <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
              Click an element to select it
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
