import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

export async function requireAdmin(userClient: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await userClient.auth.getUser()

  if (error || !user) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { data: profile, error: profileError } = await userClient
    .from('profiles')
    .select('is_admin, full_name')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.is_admin) {
    throw new Response(JSON.stringify({ error: 'Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return user
}
