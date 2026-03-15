/** Preview mode for responsive design */
export type PreviewMode = 'desktop' | 'tablet' | 'mobile'

/** Available editor panels */
export type EditorPanel = 'layers' | 'styles' | 'settings' | 'ai-chat' | 'code' | 'seo' | 'gso'

/** Editor command actions */
export type EditorCommand =
  | 'undo'
  | 'redo'
  | 'duplicate'
  | 'delete'
  | 'moveUp'
  | 'moveDown'
  | 'group'
  | 'ungroup'

/** History entry for undo/redo stack */
export type HistoryEntry = {
  id: string
  timestamp: Date
  description: string
  snapshot: unknown
}

/** Full editor state */
export type EditorState = {
  selectedBlockId: string | null
  hoveredBlockId: string | null
  previewMode: PreviewMode
  zoom: number
  panels: {
    left: EditorPanel | null
    right: EditorPanel | null
  }
  history: {
    entries: HistoryEntry[]
    currentIndex: number
  }
  isDirty: boolean
  isPreview: boolean
  isSaving: boolean
}

/** Tool call types for AI agent actions */
export type ToolCallType =
  | 'layout-design'
  | 'file-create'
  | 'file-modify'
  | 'form-create'
  | 'agent-install'

/** Tool call status */
export type ToolCallStatus = 'pending' | 'running' | 'completed' | 'failed'

/** AI tool call within a chat message */
export type ToolCall = {
  id: string
  type: ToolCallType
  data: Record<string, unknown>
  status: ToolCallStatus
  result?: unknown
  error?: string
}

/** Chat message status */
export type ChatMessageStatus = 'sending' | 'sent' | 'error'

/** Chat message in the AI assistant panel */
export type ChatMessage = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  toolCalls?: ToolCall[]
  status: ChatMessageStatus
}
