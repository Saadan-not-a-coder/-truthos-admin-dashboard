import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invokeFunction, supabase } from '@/lib/supabase'
import type { CreateOrganizationValues } from '@/schemas/organization'
import type { InviteMemberValues } from '@/schemas/invitation'
import type {
  Organization,
  OrganizationMember,
  OrganizationWithMemberCount,
} from '@/types/database'

export const organizationKeys = {
  all: ['organizations'] as const,
  list: () => [...organizationKeys.all, 'list'] as const,
  detail: (id: string) => [...organizationKeys.all, 'detail', id] as const,
  members: (id: string) => [...organizationKeys.all, 'members', id] as const,
}

export function useOrganizations() {
  return useQuery({
    queryKey: organizationKeys.list(),
    queryFn: async (): Promise<OrganizationWithMemberCount[]> => {
      const { data, error } = await supabase
        .from('organizations_with_member_count')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
  })
}

export function useOrganization(id: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async (): Promise<Organization> => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', id!)
        .single()

      if (error) throw error
      return data
    },
  })
}

export function useOrganizationMembers(organizationId: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.members(organizationId ?? ''),
    enabled: Boolean(organizationId),
    queryFn: async (): Promise<OrganizationMember[]> => {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId!)
        .order('invited_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
  })
}

interface CreateOrganizationResponse {
  organization: Organization
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: CreateOrganizationValues) => {
      return invokeFunction<CreateOrganizationResponse>('create-organization', {
        name: values.name,
        type: values.type,
        schoolDistrict: values.schoolDistrict,
        taxId: values.taxId,
        industry: values.industry,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationKeys.all })
    },
  })
}

interface InviteMemberResponse {
  member: OrganizationMember
}

export function useInviteMember(organizationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: InviteMemberValues) => {
      return invokeFunction<InviteMemberResponse>('invite-member', {
        organizationId,
        email: values.email,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: organizationKeys.members(organizationId),
      })
      void queryClient.invalidateQueries({ queryKey: organizationKeys.list() })
    },
  })
}
