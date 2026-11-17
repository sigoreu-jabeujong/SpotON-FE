import { MESSAGES } from '../../constants/messages'
import { ROUTES } from '../../constants/routes'
import BannerLink from '../common/BannerLink'
import RobotArt from '../common/RobotArt'

const T = MESSAGES.share

/**
 * 새 주소 재진단 (F-10) — 진단 조건 쿼리 없이 /diagnose로 이동해 입력값을 비운 상태로 시작한다.
 * (주소·업종·좌표·건물 키·필터·기준 시점 모두 초기화)
 */
export default function RediagnoseBanner() {
  return (
    <BannerLink
      to={ROUTES.input}
      label={T.rediagnoseLabel}
      art={<RobotArt className="size-10" />}
      title={T.rediagnoseTitle}
      desc={T.rediagnoseDesc}
    />
  )
}
