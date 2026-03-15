/** Generate URL-friendly slug from text */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/** Generate unique slug with random suffix */
export const uniqueSlug = (text: string): string => {
  const base = slugify(text)
  const suffix = Math.random().toString(36).substring(2, 8)
  return `${base}-${suffix}`
}
