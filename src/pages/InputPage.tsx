import { useNavigate } from 'react-router'
import { IMAGES } from '../assets/images'
import Logo from '../components/common/Logo'
import DiagnosisForm from '../components/input/DiagnosisForm'
import InputIntro from '../components/input/InputIntro'
import { DEFAULT_AREA, DEFAULT_INCLUDE_UNKNOWN, DEFAULT_RADIUS } from '../constants/diagnosis'
import { MESSAGES } from '../constants/messages'
import { ROUTES } from '../constants/routes'
import { toDiagnosisSearch, useDiagnosisQuery } from '../hooks/useDiagnosisQuery'

/** ② 주소·업종 입력 (STEP 01) — 2-1 기본 / 2-2 오류 / 2-3 완료. 사이드바 없음 */
export default function InputPage() {
  const navigate = useNavigate()
  // 결과 화면 STEP 01 링크로 돌아오면 이전 주소·업종을 채워 둔다
  const { query } = useDiagnosisQuery()

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-bg">
      <InputBackground />
      <header className="relative mx-auto w-full max-w-[1200px] px-10 pt-10">
        <Logo />
      </header>
      <main className="relative mx-auto flex w-full max-w-[1200px] flex-1 items-center justify-between gap-12 px-10 py-12">
        <InputIntro />
        <DiagnosisForm
          initialAddress={query.address}
          initialCategory={query.category}
          onSubmit={(address, category) => {
            // TODO: 다음 커밋에서 /geocode 결과(좌표·건물 키)로 채운다
            const search = toDiagnosisSearch({
              address,
              category,
              subCategories: [],
              radius: DEFAULT_RADIUS,
              asOf: null,
              area: DEFAULT_AREA,
              franchise: 'all',
              includeUnknown: DEFAULT_INCLUDE_UNKNOWN,
              lat: null,
              lng: null,
              buildingKey: null,
              floorUnit: null,
              sigungu: null,
            })
            navigate({ pathname: ROUTES.analysis, search })
          }}
        />
      </main>
      <footer className="relative mx-auto w-full max-w-[1200px] px-10 pb-6 text-micro text-gray-600">
        {MESSAGES.layout.ageNotice} {MESSAGES.disclaimer}
      </footer>
    </div>
  )
}

/** 배경 3D 건물·위치 핀 그림. 이미지가 없으면 연한 파란 그라데이션 임시 배경 */
function InputBackground() {
  if (IMAGES.inputBackground) {
    return (
      <img
        src={IMAGES.inputBackground}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 w-full object-cover object-top"
      />
    )
  }
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-blue-100 via-blue-100/50 to-transparent"
    />
  )
}
