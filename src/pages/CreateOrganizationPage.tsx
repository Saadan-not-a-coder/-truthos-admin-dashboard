import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createOrganizationSchema,
  organizationTypeLabels,
  organizationTypes,
  type CreateOrganizationValues,
} from '@/schemas/organization'
import { useCreateOrganization } from '@/hooks/useOrganizations'

export function CreateOrganizationPage() {
  const navigate = useNavigate()
  const createOrg = useCreateOrganization()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateOrganizationValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      type: 'school',
    },
  })

  const orgType = watch('type')

  useEffect(() => {
    setValue('schoolDistrict', '')
    setValue('taxId', '')
    setValue('industry', '')
  }, [orgType, setValue])

  const onSubmit = async (values: CreateOrganizationValues) => {
    try {
      const result = await createOrg.mutateAsync(values)
      toast.success('Organization created')
      navigate(`/organizations/${result.organization.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create organization')
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create organization</h1>
        <p className="text-muted-foreground">
          Organization type determines required fields and how it appears in the directory.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>All fields are validated on the server as well.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={orgType}
                onValueChange={(v) =>
                  setValue('type', v as CreateOrganizationValues['type'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {organizationTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {organizationTypeLabels[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            {orgType === 'school' && (
              <div className="space-y-2">
                <Label htmlFor="schoolDistrict">School district</Label>
                <Input
                  id="schoolDistrict"
                  placeholder="e.g. Portland Public Schools"
                  {...register('schoolDistrict')}
                />
                {errors.schoolDistrict && (
                  <p className="text-sm text-destructive">
                    {errors.schoolDistrict.message}
                  </p>
                )}
              </div>
            )}

            {orgType === 'nonprofit' && (
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID (EIN)</Label>
                <Input id="taxId" placeholder="12-3456789" {...register('taxId')} />
                {errors.taxId && (
                  <p className="text-sm text-destructive">{errors.taxId.message}</p>
                )}
              </div>
            )}

            {orgType === 'business' && (
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g. Financial Services"
                  {...register('industry')}
                />
                {errors.industry && (
                  <p className="text-sm text-destructive">{errors.industry.message}</p>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting || createOrg.isPending}>
                {isSubmitting || createOrg.isPending ? 'Creating…' : 'Create organization'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
