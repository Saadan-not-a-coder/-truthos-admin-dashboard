import { z } from 'https://deno.land/x/zod@v3.23.8/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createUserClient } from '../_shared/supabase.ts'
import { requireAdmin } from '../_shared/auth.ts'

const organizationTypes = ['school', 'nonprofit', 'business'] as const

const schema = z
  .object({
    name: z.string().min(2).max(120),
    type: z.enum(organizationTypes),
    schoolDistrict: z.string().optional(),
    taxId: z.string().optional(),
    industry: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'school' && !data.schoolDistrict?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'School district is required',
        path: ['schoolDistrict'],
      })
    }
    if (data.type === 'nonprofit' && !data.taxId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Tax ID is required',
        path: ['taxId'],
      })
    }
    if (data.type === 'business' && !data.industry?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Industry is required',
        path: ['industry'],
      })
    }
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
    const user = await requireAdmin(userClient)

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

    const { name, type, schoolDistrict, taxId, industry } = parsed.data

    const { data: organization, error } = await userClient
      .from('organizations')
      .insert({
        name: name.trim(),
        type,
        created_by: user.id,
        school_district: type === 'school' ? schoolDistrict?.trim() : null,
        tax_id: type === 'nonprofit' ? taxId?.trim() : null,
        industry: type === 'business' ? industry?.trim() : null,
      })
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ organization }), {
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
