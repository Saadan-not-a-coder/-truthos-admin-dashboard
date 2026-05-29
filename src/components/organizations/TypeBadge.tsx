import { Badge } from '@/components/ui/badge'
import { organizationTypeLabels } from '@/schemas/organization'
import type { OrganizationType } from '@/types/database'

export function TypeBadge({ type }: { type: OrganizationType }) {
  return (
    <Badge variant={type}>
      {organizationTypeLabels[type]}
    </Badge>
  )
}
