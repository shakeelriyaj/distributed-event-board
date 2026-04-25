/** Pedagogical mock: not real cryptography—visually represents ciphertext in transit. */
const PREFIX = 'enc:v1:'

export function mockEncrypt(plaintext: string): string {
  const bytes = new TextEncoder().encode(plaintext)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return PREFIX + btoa(bin)
}

export function mockDecrypt(ciphertext: string): string | null {
  if (!ciphertext.startsWith(PREFIX)) return null
  try {
    const raw = atob(ciphertext.slice(PREFIX.length))
    const out = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
    return new TextDecoder().decode(out)
  } catch {
    return null
  }
}
