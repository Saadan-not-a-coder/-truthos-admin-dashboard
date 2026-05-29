import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export function AccessDeniedPage() {
  const { signOut } = useAuth()

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Access denied</CardTitle>
          <CardDescription>
            Your account is signed in but does not have admin privileges.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button onClick={() => void signOut()}>Sign out</Button>
          <Button variant="outline" asChild>
            <Link to="/sign-in">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
