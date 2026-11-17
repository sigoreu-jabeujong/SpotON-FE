/*
 * Spot:ON 설치용 최소 서비스 워커 — 휴대폰 "홈 화면에 추가"(PWA) 조건만 맞춘다.
 * 화면·자료를 미리 저장(caches)하지 않고, fetch 이벤트도 받지 않아 모든 요청은 브라우저 기본(네트워크)으로 간다.
 * 업데이트 뒤 옛 화면이 남지 않게 하려는 결정 (docs/decisions.md "PWA").
 */
self.addEventListener('install', () => {
  // 새 버전이 오면 기다리지 않고 바로 교체
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  // 열려 있는 화면도 바로 새 워커가 맡는다
  event.waitUntil(self.clients.claim())
})
