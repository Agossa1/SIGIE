import { useState, type ReactNode } from "react"
import { useAppDispatch, useAppSelector } from "../../stores/hooks"
import { logoutThunk } from "../../feature/auth/services/auth.thunk"
import { selectCurrentUser } from "../../feature/auth/services/auth.selectors"
import BeninFlagBar from "../../components/ui/BeninFlagBar"
import UnifiedSidebar from "../../components/sidebar/UnifiedSidebar"
import { GPSCheckInButton } from "../../feature/teams/components/GPSCheckInButton"

interface TechnicianLayoutProps {
  children: ReactNode
}

const TechnicianLayout = ({ children }: TechnicianLayoutProps) => {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(selectCurrentUser)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const handleLogout = () => {
    dispatch(logoutThunk())
  }

  return (
    <div className="min-h-screen bg-gray-50/70 text-black flex flex-col antialiased">
      <BeninFlagBar size="lg" className="sticky top-0 z-50" />

      <div className="flex flex-1 min-h-0">
      <UnifiedSidebar
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Ouvrir le menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-medium text-emerald-700 truncate mx-2 flex-1 text-center">HSE TERRA — Terrain</span>
          <GPSCheckInButton variant="icon" />
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
      </div>
    </div>
  )
}

export default TechnicianLayout
