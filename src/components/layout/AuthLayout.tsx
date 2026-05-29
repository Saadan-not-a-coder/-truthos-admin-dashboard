import { Link, Outlet } from 'react-router-dom'
import { Building2 } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link to="/" className="mb-8 flex items-center gap-2 text-lg font-semibold">
        <Building2 className="h-6 w-6" />
        Admin Dashboard
      </Link>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
