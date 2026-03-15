import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Editor — UBuilder AI',
}

const EditorLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-bg-secondary">
      {children}
    </div>
  )
}

export default EditorLayout
