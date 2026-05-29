import { Badge } from '@/components/ui/badge'
import type { MemberStatus } from '@/types/database'

const labels: Record<MemberStatus, string> = {
  invited: 'Invited',
  active: 'Active',
}

export function MemberStatusBadge({ status }: { status: MemberStatus }) {
  return (
    <Badge variant={status}>
      {labels[status]}
    </Badge>
  )
}
