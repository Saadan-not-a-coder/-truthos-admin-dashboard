import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Configure .env for local development.',
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

export async function invokeFunction<T>(
  name: string,
  body: Record<string, unknown>,
): Promise<T> {
  const token = await getAccessToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase.functions.invoke<T>(name, {
    body,
    headers: { Authorization: `Bearer ${token}` },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data as T
}
