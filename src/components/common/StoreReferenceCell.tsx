import { formatDate } from '../../utils/format'
import { MESSAGES } from '../../constants/messages'
export default function StoreReferenceCell({ asOf }: { asOf?: string | null }) {
  return (
    <span className="whitespace-nowrap">{formatDate(asOf) ?? MESSAGES.store.missingValue}</span>
  )
}
