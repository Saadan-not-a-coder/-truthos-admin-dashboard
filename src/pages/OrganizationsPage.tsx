import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Building2, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { TypeBadge } from '@/components/organizations/TypeBadge'
import { useOrganizations } from '@/hooks/useOrganizations'

export function OrganizationsPage() {
  const { data: organizations, isLoading, isError, error, refetch } = useOrganizations()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Organizations you have created and manage.
          </p>
        </div>
        <Button asChild>
          <Link to="/organizations/new">
            <Plus className="h-4 w-4" />
            Create organization
          </Link>
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <ErrorState
          message={error instanceof Error ? error.message : 'Failed to load organizations'}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && organizations?.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No organizations yet"
          description="Create your first organization to start inviting members."
          action={
            <Button asChild>
              <Link to="/organizations/new">Create organization</Link>
            </Button>
          }
        />
      )}

      {!isLoading && !isError && organizations && organizations.length > 0 && (
        <div className="space-y-3">
          {organizations.map((org) => (
            <Link key={org.id} to={`/organizations/${org.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4 sm:p-6">
                  <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <TypeBadge type={org.type} />
                        <span>·</span>
                        <span>
                          {org.member_count} member{org.member_count === 1 ? '' : 's'}
                        </span>
                        <span>·</span>
                        <span>Created {format(new Date(org.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
