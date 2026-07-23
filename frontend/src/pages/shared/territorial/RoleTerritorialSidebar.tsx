import { useEffect } from "react"
import type { MouseEventHandler } from "react"
import { Link, useLocation } from "react-router-dom"
import type { User } from "../../../feature/auth/services/auth.types"
import { useAuthRoles } from "../../../feature/auth/hooks/useAuthRoles"
import { buildRolePath } from "../rolePages.config"
import type { RoleFolderConfig } from "../rolePages.config"
import { buildNavSections } from "./roleNavSections"

interface RoleTerritorialSidebarProps {
  config: RoleFolderConfig
  currentUser: User | null
  onLogout: MouseEventHandler<HTMLButtonElement>
  isOpen: boolean
  onClose: () => void
}

const SidebarContent = ({
  config,
  currentUser,
  onLogout,
  onClose,
}: {
  config: RoleFolderConfig
  currentUser: User | null
  onLogout: MouseEventHandler<HTMLButtonElement>
  onClose: () => void
}) => {
  const { roles } = useAuthRoles()
  const { pathname } = useLocation()
  
  const isFieldAgent = config.folder === "techniciens" || config.folder === "teamLeader";
  const sections = buildNavSections(config.pages, isFieldAgent)

  const displayName = currentUser
    ? `${currentUser.firstName ?? ""} ${currentUser.lastName ?? ""}`.trim() || currentUser.email
    : config.label

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "H"

  return (
    <div className="flex flex-col flex-1 overflow-y-auto h-full">
      <div className="h-16 px-6 flex items-center justify-between gap-3 mt-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-emerald-700 flex items-center justify-center font-medium text-white text-sm shrink-0">
            H
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-sm font-medium text-emerald-700 leading-none">HSE TERRA</h1>
            <span className="text-sm text-gray-800 mt-1 leading-none">{config.label}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Fermer le menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="px-4 mb-4 shrink-0">
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5">
          <span className="text-sm text-gray-600 font-medium leading-none">Niveau d'autorité</span>
          <span className="text-sm font-medium text-emerald-700 mt-2 block leading-none">{config.label}</span>
        </div>
      </div>

      <nav className="p-4 pt-0 space-y-5 flex-1 text-sm">
        {sections.map((section) => (
          <div key={section.label} className="space-y-1">
            <span className="text-sm font-medium text-gray-900 px-3 block mb-2">{section.label}</span>
            {section.items.map((item) => {
              const to = buildRolePath(roles, item.id)
              const isActive = pathname === to
              return (
                <Link
                  key={item.id}
                  to={to}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[14px] font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-emerald-600 text-white"
                      : "text-gray-800 hover:bg-emerald-50 hover:text-black"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-gray-900"}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100 flex flex-col gap-3 shrink-0">
        <div className="bg-gray-50 border border-gray-100/50 rounded-xl p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800 leading-tight">Synchro territoriale</p>
              <p className="text-sm text-gray-400 font-semibold mt-1">Données à jour</p>
            </div>
            <span className="text-emerald-500 text-sm font-medium">✓</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2.5">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "100%" }} />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-medium text-white text-sm shrink-0">
              {initials}
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-sm font-medium text-black leading-tight truncate">{displayName}</span>
              <button
                type="button"
                onClick={onLogout}
                className="text-sm font-semibold text-rose-600 hover:underline leading-none mt-1 text-left"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const RoleTerritorialSidebar = ({ config, currentUser, onLogout, isOpen, onClose }: RoleTerritorialSidebarProps) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col justify-between shrink-0 h-screen sticky top-0 z-20">
        <SidebarContent config={config} currentUser={currentUser} onLogout={onLogout} onClose={onClose} />
      </aside>

      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] overlay-in"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl sidebar-open">
            <SidebarContent config={config} currentUser={currentUser} onLogout={onLogout} onClose={onClose} />
          </div>
        </div>
      )}
    </>
  )
}

export default RoleTerritorialSidebar
