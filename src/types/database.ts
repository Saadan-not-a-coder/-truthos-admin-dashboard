export type OrganizationType = 'school' | 'nonprofit' | 'business'
export type MemberStatus = 'invited' | 'active'
export type MemberRole = 'admin' | 'member'

export interface Profile {
  id: string
  full_name: string | null
  is_admin: boolean
  created_at: string
}

export interface Organization {
  id: string
  name: string
  type: OrganizationType
  created_by: string
  created_at: string
  school_district: string | null
  tax_id: string | null
  industry: string | null
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string | null
  email: string
  status: MemberStatus
  role: MemberRole
  invited_at: string
  joined_at: string | null
}

export interface OrganizationWithMemberCount extends Organization {
  member_count: number
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: {
          id: string
          full_name?: string | null
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          full_name?: string | null
          is_admin?: boolean
        }
        Relationships: []
      }
      organizations: {
        Row: Organization
        Insert: {
          id?: string
          name: string
          type: OrganizationType
          created_by: string
          created_at?: string
          school_district?: string | null
          tax_id?: string | null
          industry?: string | null
        }
        Update: {
          name?: string
          type?: OrganizationType
          school_district?: string | null
          tax_id?: string | null
          industry?: string | null
        }
        Relationships: []
      }
      organization_members: {
        Row: OrganizationMember
        Insert: {
          id?: string
          organization_id: string
          user_id?: string | null
          email: string
          status?: MemberStatus
          role?: MemberRole
          invited_at?: string
          joined_at?: string | null
        }
        Update: {
          user_id?: string | null
          email?: string
          status?: MemberStatus
          role?: MemberRole
          joined_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      organizations_with_member_count: {
        Row: OrganizationWithMemberCount
        Insert: never
        Update: never
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: {
      organization_type: OrganizationType
      member_status: MemberStatus
      member_role: MemberRole
    }
    CompositeTypes: Record<string, never>
  }
}
