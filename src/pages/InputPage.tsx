import { useNavigate } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import { rememberAddress } from '../utils/addressConfirmation'
import { selectAddress } from '../utils/addressSelection'
import { normalizeAddressDetail } from '../api/addressDetail'
import { IMAGES } from '../assets/images'
import Logo from '../components/common/Logo'
import SiteFooter from '../components/layout/SiteFooter'
import CandidateList from '../components/input/CandidateList'
import DiagnosisForm from '../components/input/DiagnosisForm'
import InputIntro from '../components/input/InputIntro'
import { DEFAULT_AREA, DEFAULT_INCLUDE_UNKNOWN, DEFAULT_RADIUS } from '../constants/diagnosis'
import { getErrorMessageFrom, MESSAGES } from '../constants/messages'
import { ROUTES } from '../constants/routes'
import { toDiagnosisSearch, useDiagnosisQuery } from '../hooks/useDiagnosisQuery'
import { useGeocodeSearch } from '../hooks/useGeocode'
import type { GeocodeCandidate } from '../types/geocode'
import { usePageTitle } from '../hooks/usePageTitle'
import { useWarmUpBackend } from '../hooks/useWarmUpBackend'
import SkipLink, { MAIN_ID } from '../components/common/SkipLink'

/** ② 주소·업종 입력 (STEP 01) — 2-1 기본 / 2-2 오류 / 2-3 완료. 사이드바 없음 */
export default function InputPage() {
  usePageTitle(MESSAGES.titles.input)
  // 주소를 입력하는 동안 잠든 무료 서버를 미리 깨운다 (실제 서버 모드에서만, 탭당 한 번)
  useWarmUpBackend()
  const navigate = useNavigate()
  // 결과 화면 STEP 01 링크로 돌아오면 이전 주소·업종을 채워 둔다
  const { query } = useDiagnosisQuery()
  const geocode = useGeocodeSearch()
  const generation = useRef(0)
  useEffect(
    () => () => {
      generation.current += 1
    },
    [],
  )
  const [choices, setChoices] = useState<GeocodeCandidate[]>([])
  const [detail, setDetail] = useState(query.detailText ?? query.floorUnit ?? '')
  const [confirming, setConfirming] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const confirm = async (candidate: GeocodeCandidate, enteredDetail: string) => {
    if (confirming) return
    const token = generation.current
    setConfirming(true)
    setDetailError(null)
    try {
      const normalized = !enteredDetail.trim()
        ? null
        : (await normalizeAddressDetail(enteredDetail)).floor_unit
      if (token !== generation.current) return
      if (
        enteredDetail.trim() &&
        (!normalized || !/^(?:[1-9]\d{0,2}층|B[1-9]\d{0,2})(?: |$)/.test(normalized))
      ) {
        setDetailError(
          '층·호수를 확인할 수 없어요. 주소 입력칸에서 상세주소를 수정한 뒤 다시 검색해 주세요.',
        )
        return
      }
      goToResult({ ...candidate, floor_unit: normalized }, enteredDetail)
    } catch {
      if (token === generation.current)
        setDetailError('상세주소 확인에 실패했어요. 주소 입력칸에서 다시 검색해 주세요.')
    } finally {
      if (token === generation.current) setConfirming(false)
    }
  }

  /** 선택한 주소(geocode 결과)로 결과 화면 이동. 진단 조건은 기본값에서 시작 */
  const goToResult = (c: GeocodeCandidate, enteredDetail: string) => {
    const search = toDiagnosisSearch({
      address: c.address_road || c.address_jibun,
      detailText: enteredDetail.trim(),
      detailUnverified: !!enteredDetail.trim() && !c.floor_unit,
      category: c.category,
      subCategories: [],
      radius: DEFAULT_RADIUS,
      asOf: null,
      area: DEFAULT_AREA,
      franchise: 'all',
      includeUnknown: DEFAULT_INCLUDE_UNKNOWN,
      lat: c.lat,
      lng: c.lng,
      buildingKey: c.building_key,
      floorUnit: c.floor_unit,
      sigungu: c.sigungu,
    })
    rememberAddress(search)
    navigate({ pathname: ROUTES.analysis, search })
  }

  return (
    <div className="flex min-h-full flex-col bg-bg">
      <SkipLink />
      {/* 첫 화면은 그대로, 하단 안내는 공통 SiteFooter로 */}
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
        <InputBackground />
        <header className="relative mx-auto w-full max-w-[1200px] px-10 pt-10 max-md:px-4 max-md:pt-6">
          <Logo />
        </header>
        <main
          id={MAIN_ID}
          tabIndex={-1}
          // 휴대폰(768px 미만): 소개와 입력 카드를 한 단으로 (데스크톱 두 단 배치는 그대로)
          className="relative mx-auto flex w-full max-w-[1200px] flex-1 items-center justify-between gap-12 px-10 py-12 focus:outline-none max-md:flex-col max-md:items-stretch max-md:gap-8 max-md:px-4 max-md:py-8"
        >
          <InputIntro />
          <DiagnosisForm
            initialAddress={[query.address, query.detailText ?? query.floorUnit]
              .filter(Boolean)
              .join(' ')}
            initialCategory={query.category}
            loading={geocode.isPending || confirming}
            apiError={detailError ?? (geocode.error ? getErrorMessageFrom(geocode.error) : null)}
            onChange={() => {
              // 주소·업종을 바꾸면 이전 검색 결과(후보·오류)를 지운다
              generation.current += 1
              setConfirming(false)
              setChoices([])
              setDetail('')
              setDetailError(null)
              geocode.reset()
            }}
            onSubmit={(address, category) => {
              const token = ++generation.current
              setConfirming(false)
              setChoices([])
              setDetailError(null)
              geocode.mutate(
                { query: address, category },
                {
                  onSuccess: ({ data }) => {
                    if (token !== generation.current) return
                    const next = data.candidates.length ? data.candidates : [data]
                    const resolved = selectAddress(address, next)
                    setDetail(resolved.detail)
                    setChoices(resolved.selected ? [] : next)
                    if (resolved.selected) {
                      void confirm(resolved.selected, resolved.detail)
                    }
                  },
                },
              )
            }}
          >
            {choices.length > 0 && (
              <CandidateList
                candidates={choices}
                detail={detail}
                disabled={confirming}
                onSelect={(c) => {
                  generation.current += 1
                  setConfirming(false)
                  setDetailError(null)
                  void confirm(c, detail)
                }}
              />
            )}
          </DiagnosisForm>
        </main>
      </div>
      <SiteFooter />
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
        className="pointer-events-none absolute inset-x-0 bottom-0 w-full max-w-none translate-y-[22%]"
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
