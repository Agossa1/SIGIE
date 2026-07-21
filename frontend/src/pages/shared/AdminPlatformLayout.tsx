import { useState, type MouseEventHandler, type ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../stores/hooks"
import { logoutThunk } from "../../feature/auth/services/auth.thunk"
import { selectCurrentUser, selectIsAuthenticated } from "../../feature/auth/services/auth.selectors"
import { User_Role } from "../../feature/auth/services/auth.types"
import BeninFlagBar from "../../components/ui/BeninFlagBar"
import AdminNavbar from "../../components/navbar/AdminNavbar"
import UnifiedSidebar from "../../components/sidebar/UnifiedSidebar"
import RoleGuard from "../../feature/auth/components/RoleGuard"

interface AdminPlatformLayoutProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

const AdminPlatformLayout = ({ title, subtitle, actions, children }: AdminPlatformLayoutProps) => {
  const dispatch = useAppDispatch()
  const currentAdmin = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout: MouseEventHandler<HTMLButtonElement> = async () => {
    await dispatch(logoutThunk())
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <RoleGuard
      allowedRoles={[User_Role.SUPER_ADMIN, User_Role.PLATFORM_ADMIN]}
      fallback={<Navigate to="/login" replace />}
    >
      <div className="min-h-screen bg-gray-50/70 text-black flex flex-col antialiased">
        <BeninFlagBar size="lg" className="sticky top-0 z-50 w-full" />

        <div className="flex flex-1 min-h-0">
          <UnifiedSidebar
            currentUser={currentAdmin}
            onLogout={handleLogout}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <AdminNavbar
              currentAdmin={currentAdmin}
              onMenuOpen={() => setIsSidebarOpen(true)}
            />

            <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-medium text-black">{title}</h2>
                  {subtitle && (
                    <p className="text-sm font-semibold text-gray-500 mt-1">{subtitle}</p>
                  )}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
              </div>
              {children}
            </main>
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}

export default AdminPlatformLayout
