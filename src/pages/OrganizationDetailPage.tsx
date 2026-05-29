import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Mail, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { LoadingState } from '@/components/common/LoadingState'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { TypeBadge } from '@/components/organizations/TypeBadge'
import { MemberStatusBadge } from '@/components/organizations/MemberStatusBadge'
import {
  useInviteMember,
  useOrganization,
  useOrganizationMembers,
} from '@/hooks/useOrganizations'
import { inviteMemberSchema, type InviteMemberValues } from '@/schemas/invitation'
import { organizationTypeLabels } from '@/schemas/organization'
import type { OrganizationType } from '@/types/database'

function typeSpecificDetail(org: {
  type: OrganizationType
  school_district: string | null
  tax_id: string | null
  industry: string | null
}) {
  switch (org.type) {
    case 'school':
      return org.school_district ? `District: ${org.school_district}` : null
    case 'nonprofit':
      return org.tax_id ? `EIN: ${org.tax_id}` : null
    case 'business':
      return org.industry ? `Industry: ${org.industry}` : null
  }
}

export function OrganizationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const {
    data: organization,
    isLoading: orgLoading,
    isError: orgError,
    error: orgErr,
    refetch: refetchOrg,
  } = useOrganization(id)
  const {
    data: members,
    isLoading: membersLoading,
    isError: membersError,
    error: membersErr,
    refetch: refetchMembers,
  } = useOrganizationMembers(id)
  const inviteMember = useInviteMember(id ?? '')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
  })

  const onInvite = async (values: InviteMemberValues) => {
    try {
      await inviteMember.mutateAsync(values)
      toast.success(`Invitation created for ${values.email}`)
      reset()
      // Email delivery would be triggered here, e.g.:
      // await supabase.functions.invoke('send-invitation-email', { body: { memberId } })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send invitation')
    }
  }

  if (orgLoading) {
    return <LoadingState message="Loading organization…" />
  }

  if (orgError || !organization) {
    return (
      <ErrorState
        message={
          orgErr instanceof Error ? orgErr.message : 'Organization not found or inaccessible'
        }
        onRetry={() => void refetchOrg()}
      />
    )
  }

  const detail = typeSpecificDetail(organization)

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/" aria-label="Back to organizations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{organization.name}</h1>
            <TypeBadge type={organization.type} />
          </div>
          <p className="text-muted-foreground">
            {organizationTypeLabels[organization.type]}
            {detail && ` · ${detail}`}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5" />
              Invite member
            </CardTitle>
            <CardDescription>
              Invitations are created server-side. Email delivery would plug in at the edge
              function after the record is saved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onInvite)} className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 space-y-2">
                <Label htmlFor="email" className="sr-only">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="member@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <Button
                type="submit"
                className="sm:self-start"
                disabled={isSubmitting || inviteMember.isPending}
              >
                {isSubmitting || inviteMember.isPending ? 'Inviting…' : 'Send invite'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Members
            </CardTitle>
            <CardDescription>
              {members?.length ?? 0} member{(members?.length ?? 0) === 1 ? '' : 's'} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {membersLoading && (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            )}

            {membersError && (
              <ErrorState
                message={
                  membersErr instanceof Error ? membersErr.message : 'Failed to load members'
                }
                onRetry={() => void refetchMembers()}
              />
            )}

            {!membersLoading && !membersError && members?.length === 0 && (
              <EmptyState
                icon={Users}
                title="No members yet"
                description="Invite someone by email to add them to this organization."
              />
            )}

            {!membersLoading && !membersError && members && members.length > 0 && (
              <ul className="divide-y">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{member.email}</p>
                      <p className="text-xs capitalize text-muted-foreground">{member.role}</p>
                    </div>
                    <MemberStatusBadge status={member.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
