import { useEffect } from 'react'
import { warmUpBackend } from '../api/health'

/** 화면이 열릴 때 백엔드를 미리 깨운다 (실제 서버 모드에서만, 탭당 한 번 — api/health.ts) */
export function useWarmUpBackend() {
  useEffect(() => {
    warmUpBackend()
  }, [])
}
