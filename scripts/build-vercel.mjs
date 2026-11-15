import { spawnSync } from 'node:child_process'
import { analysisVersionForVercel } from './vercel-profile.mjs'

const version = analysisVersionForVercel(process.env.VERCEL_ENV)
if (!process.env.npm_execpath) throw new Error('Run this script with npm run build:vercel')
console.log(`Vercel ${process.env.VERCEL_ENV}: analysis API ${version}`)
const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, VITE_ANALYSIS_API_VERSION: version },
})
if (result.error) throw result.error
process.exit(result.status ?? 1)
