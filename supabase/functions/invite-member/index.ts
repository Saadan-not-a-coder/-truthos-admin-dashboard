import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createServiceClient, createUserClient } from '../_shared/supabase.ts'
import { requireAdmin } from '../_shared/auth.ts'

const schema = z.object({
  organizationId: z.string().uuid(),
  email: z.string().email(),
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userClient = createUserClient(authHeader)
    await requireAdmin(userClient)

    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', details: parsed.error.flatten() }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const { organizationId, email } = parsed.data
    const normalizedEmail = email.trim().toLowerCase()

    const { data: organization, error: orgError } = await userClient
      .from('organizations')
      .select('id, name, created_by')
      .eq('id', organizationId)
      .single()

    if (orgError || !organization) {
      return new Response(JSON.stringify({ error: 'Organization not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const serviceClient = createServiceClient()

    const { data: existing } = await serviceClient
      .from('organization_members')
      .select('id')
      .eq('organization_id', organizationId)
      .ilike('email', normalizedEmail)
      .maybeSingle()

    if (existing) {
      return new Response(
        JSON.stringify({ error: 'This email has already been invited to this organization' }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const { data: member, error: insertError } = await serviceClient
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        email: normalizedEmail,
        status: 'invited',
        role: 'member',
      })
      .select()
      .single()

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Email delivery hook — plug in Resend, SendGrid, etc.
    // await sendInvitationEmail({ to: normalizedEmail, orgName: organization.name, memberId: member.id })

    return new Response(JSON.stringify({ member }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    if (err instanceof Response) return err
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
