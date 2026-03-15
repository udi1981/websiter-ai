export type User = {
  id: string
  email: string
  name: string | null
  avatar: string | null
  locale: string
  plan: 'free' | 'starter' | 'pro' | 'enterprise'
  createdAt: Date
  updatedAt: Date
}

export type Session = {
  id: string
  userId: string
  expiresAt: Date
  createdAt: Date
}
