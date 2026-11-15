/** Public production uses the verified v2 BE; preview remains on the v1 mock. */
export function analysisVersionForVercel(environment) {
  if (environment === 'production') return 'v2'
  if (environment === 'preview' || environment === 'development') return 'v1'
  throw new Error('VERCEL_ENV must be production, preview, or development')
}
