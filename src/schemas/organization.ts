import { z } from 'zod'

export const organizationTypes = ['school', 'nonprofit', 'business'] as const

export const organizationTypeLabels: Record<
  (typeof organizationTypes)[number],
  string
> = {
  school: 'School',
  nonprofit: 'Nonprofit',
  business: 'Business',
}

const baseOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  type: z.enum(organizationTypes),
  schoolDistrict: z.string().optional(),
  taxId: z.string().optional(),
  industry: z.string().optional(),
})

export const createOrganizationSchema = baseOrganizationSchema.superRefine(
  (data, ctx) => {
    if (data.type === 'school') {
      if (!data.schoolDistrict?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'School district is required for schools',
          path: ['schoolDistrict'],
        })
      }
    }
    if (data.type === 'nonprofit') {
      if (!data.taxId?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Tax ID (EIN) is required for nonprofits',
          path: ['taxId'],
        })
      } else if (!/^\d{2}-?\d{7}$/.test(data.taxId.replace(/\s/g, ''))) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a valid EIN (e.g. 12-3456789)',
          path: ['taxId'],
        })
      }
    }
    if (data.type === 'business') {
      if (!data.industry?.trim()) {
        ctx.addIssue({
          code: 'custom',
          message: 'Industry is required for businesses',
          path: ['industry'],
        })
      }
    }
  },
)

export type CreateOrganizationValues = z.infer<typeof createOrganizationSchema>
