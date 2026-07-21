import { useState, type MouseEventHandler, type ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../../stores/hooks"
import { logoutThunk } from "../../../feature/auth/services/auth.thunk"
import { selectCurrentUser, selectIsAuthenticated } from "../../../feature/auth/services/auth.selectors"
import type { User_Role } from "../../../feature/auth/services/auth.types"
import BeninFlagBar from "../../../components/ui/BeninFlagBar"
import RoleGuard from "../../../feature/auth/components/RoleGuard"
import type { RoleFolderConfig } from "../rolePages.config"
import RoleTerritorialNavbar from "./RoleTerritorialNavbar"
import RoleTerritorialSidebar from "./RoleTerritorialSidebar"
import { getScopeForFolder } from "./roleScopeLabels"

interface RoleTerritorialLayoutProps {
  config: RoleFolderConfig
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

const RoleTerritorialLayout = ({
  config,
  title,
  subtitle,
  actions,
  children,
}: RoleTerritorialLayoutProps) => {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(selectCurrentUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const scope = getScopeForFolder(config.folder)

  const handleLogout: MouseEventHandler<HTMLButtonElement> = async () => {
    await dispatch(logoutThunk())
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <RoleGuard
      allowedRoles={config.roles as User_Role[]}
      fallback={<Navigate to="/login" replace />}
    >
      <div className="min-h-screen bg-gray-50/70 text-black flex flex-col antialiased">
        <BeninFlagBar size="lg" className="sticky top-0 z-50 w-full" />

        <div className="flex flex-1 min-h-0">
          <RoleTerritorialSidebar
            config={config}
            currentUser={currentUser}
            onLogout={handleLogout}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <RoleTerritorialNavbar
              currentUser={currentUser}
              spaceSubtitle={scope.spaceSubtitle}
              displayRole={config.label}
              perimeterHint={scope.perimeterTag}
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

export default RoleTerritorialLayout
