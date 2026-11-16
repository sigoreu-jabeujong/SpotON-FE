/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { parseAnalysisVersion } from './src/config/analysisVersion.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  parseAnalysisVersion(
    process.env.VITE_ANALYSIS_API_VERSION ??
      loadEnv(mode, process.cwd(), 'VITE_').VITE_ANALYSIS_API_VERSION,
  )
  return {
    plugins: [react(), tailwindcss()],
    // 순수 함수와 서버 렌더링 표시 계약 — jsdom 없이 node 환경에서 확인한다.
    test: {
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
      environment: 'node',
    },
  }
})
