import { ExternalLink, Handshake, Headset, type LucideIcon } from 'lucide-react'
import { MESSAGES } from '../../constants/messages'
import { useDiagnosisQuery } from '../../hooks/useDiagnosisQuery'
import { useSupportLinks } from '../../hooks/useSupportLinks'
import type { SupportLink } from '../../types/support'
import { formatDate } from '../../utils/format'
import EmptyState from '../common/EmptyState'
import ErrorState from '../common/ErrorState'
import LoadingState from '../common/LoadingState'
import MetaLine from '../common/MetaLine'
import SubTitle from '../common/SubTitle'

const T = MESSAGES.share

/**
 * 공공 창업 상담·지원 연결 (F-10) — /support-links.
 * 자치구(gu)·업종으로 서버가 정렬해 주고, consulting은 상담센터, support_program은 지원사업으로 묶는다.
 */
export default function SupportLinksSection() {
  const { query } = useDiagnosisQuery()
  const links = useSupportLinks({ sigungu: query.sigungu, category: query.category })

  if (links.isPending) return <LoadingState />
  if (links.isError) return <ErrorState error={links.error} onRetry={() => void links.refetch()} />

  const all = links.data.data.links
  const consulting = all.filter((l) => l.type === 'consulting')
  const support = all.filter((l) => l.type === 'support_program')
  const meta = links.data.meta

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-6">
        <LinkGroup
          id="links-consulting"
          icon={Headset}
          title={T.consultingTitle}
          links={consulting}
        />
        <LinkGroup id="links-support" icon={Handshake} title={T.supportTitle} links={support} />
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
}: {
  id: string
  icon: LucideIcon
  title: string
  links: SupportLink[]
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-8 flex-col gap-3">
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
                className="group flex items-start justify-between gap-3 rounded-control border border-gray-300 bg-gray-0 px-4 py-3 transition-colors hover:border-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              >
                <span className="min-w-0">
                  <span className="block text-micro font-semibold text-blue-700">{l.org_name}</span>
                  <span className="block text-body font-bold text-gray-900">{l.title}</span>
                  <span className="block text-caption text-gray-600">{l.description}</span>
                  <span className="mt-1 block text-micro text-gray-600">
                    {l.region} · {T.lastChecked(formatDate(l.last_checked) ?? l.last_checked)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-1 text-caption font-semibold text-blue-700">
                  <span className="sr-only">{T.newWindow}</span>
                  <ExternalLink className="size-4" aria-hidden="true" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
