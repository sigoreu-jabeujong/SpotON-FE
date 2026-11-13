/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 단위 테스트 (npm run test) — 순수 함수만 테스트하므로 브라우저 흉내(jsdom) 없이 node 환경
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
