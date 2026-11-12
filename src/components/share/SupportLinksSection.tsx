import { ExternalLink, Handshake, Headset, Info, type LucideIcon } from 'lucide-react'
import { MESSAGES } from '../../constants/messages'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import { useSupportLinks } from '../../hooks/useSupportLinks'
import type { SupportLink } from '../../types/support'
import { formatDate } from '../../utils/format'
import Badge from '../common/Badge'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import LoadingSkeleton from '../common/Skeleton'
import MetaLine from '../common/MetaLine'
import SubTitle from '../common/SubTitle'

const T = MESSAGES.share

/**
 * 공공 창업 상담·지원 연결 (F-10) — /support-links (BE docs/fe-support-links-api-request.md).
 * - 보내는 값은 구(sigungu)·업종뿐 (주소·좌표·건물 키 안 보냄, 빈 값은 client가 생략)
 * - 구를 지정하면 서버가 관할 센터 1곳을 맨 앞에 붙여 5곳을 준다 → 서버 순서 그대로, 자르거나 다시 정렬하지 않음
 * - consulting은 상담센터, support_program은 지원사업으로 묶는다 (각 묶음 안 순서는 서버 순서)
 * - 설명·확인일은 서버 값 그대로. "맞춤·신청 가능·자격" 표현을 쓰지 않는다
 */
export default function SupportLinksSection() {
  const { query } = useDiagnosisQuery()
  const links = useSupportLinks({ sigungu: query.sigungu, category: query.category })

  if (links.isPending) return <LoadingSkeleton variant="links" />
  if (links.isError) return <ErrorState error={links.error} onRetry={() => void links.refetch()} />

  const all = links.data.data.links ?? []
  const consulting = all.filter((l) => l.type === 'consulting')
  const support = all.filter((l) => l.type === 'support_program')
  const meta = links.data.meta
  // prioritization applied = 구 관할 연락처가 배열 맨 앞 (가까운 순·업종 추천 아님)
  const districtId = meta?.prioritization?.status === 'applied' ? (all[0]?.id ?? null) : null
  const source = meta?.district_contact_source

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-6">
        <LinkGroup
          id="links-consulting"
          icon={Headset}
          title={T.consultingTitle}
          links={consulting}
          districtId={districtId}
        />
        <LinkGroup id="links-support" icon={Handshake} title={T.supportTitle} links={support} />
      </div>
      <div className="flex flex-col gap-1 text-caption text-gray-600">
        <p className="flex items-start gap-1.5">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {T.linksNotice}
        </p>
        {districtId && source && (
          // 공고일·확인일은 서버 값 그대로 (분석 기준일과 다른 날짜)
          <p className="pl-5.5">
            {T.districtSource(
              formatDate(source.published_on),
              formatDate(source.checked_on),
              source.page ?? null,
            )}
          </p>
        )}
      </div>
      <MetaLine source={meta?.source} sourceNames isDemo={meta?.is_demo} />
    </div>
  )
}

function LinkGroup({
  id,
  icon: Icon,
  title,
  links,
  districtId = null,
}: {
  id: string
  icon: LucideIcon
  title: string
  links: SupportLink[]
  /** 관할 지역센터 항목 id (구 지정 시) — 배지로만 구분 */
  districtId?: string | null
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-sticky flex-col gap-3"
    >
      <SubTitle id={`${id}-title`}>
        <span className="inline-flex items-center gap-1.5">
          <Icon className="size-4 text-blue-500" aria-hidden="true" />
          {title}
        </span>
      </SubTitle>
      {links.length === 0 ? (
        <EmptyState message={T.linksEmpty} />
      ) : (
        <ul className="flex flex-col gap-2">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex interactive-lift items-start justify-between gap-3 rounded-control border border-gray-300 bg-gray-0 px-4 py-3 hover:border-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                <span className="min-w-0">
                  {l.id === districtId && (
                    <Badge tone="blue" className="mb-1">
                      {T.districtBadge}
                    </Badge>
                  )}
                  <span className="block text-micro font-semibold text-blue-700">{l.org_name}</span>
                  <span className="block text-body font-bold text-gray-900">{l.title}</span>
                  <span className="block text-caption text-gray-600">{l.description}</span>
                  <span className="mt-1 block text-micro text-gray-600">
                    {l.region} · {T.lastChecked(formatDate(l.last_checked) ?? l.last_checked)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-caption font-semibold text-blue-700">
                  <span className="sr-only">{T.newWindow}</span>
                  <ExternalLink className="size-4 arrow-nudge" aria-hidden="true" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
