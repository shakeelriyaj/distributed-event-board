export type AtprotoFrontendConfig = {
  service: string
  identifier: string
  password: string
}

const DEFAULT_SERVICE = 'https://bsky.social'

export function getAtprotoConfig(): AtprotoFrontendConfig {
  const service = import.meta.env.VITE_ATP_SERVICE || DEFAULT_SERVICE
  const identifier = import.meta.env.VITE_ATP_IDENTIFIER || ''
  const password = import.meta.env.VITE_ATP_PASSWORD || ''

  return {
    service,
    identifier,
    password,
  }
}

export function assertAtprotoConfig(config: AtprotoFrontendConfig) {
  if (!config.identifier || !config.password) {
    throw new Error('Missing VITE_ATP_IDENTIFIER or VITE_ATP_PASSWORD in frontend env.')
  }
}
