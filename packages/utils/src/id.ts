/** Generate a random ID (nanoid-like, no external dep) */
export const generateId = (length = 21): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length]
  }
  return result
}

/** Generate a prefixed ID (e.g., "site_abc123") */
export const prefixedId = (prefix: string, length = 16): string => {
  return `${prefix}_${generateId(length)}`
}
