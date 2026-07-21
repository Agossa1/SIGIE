import type { User } from "../../../feature/auth/services/auth.types"
import BeninFlagBar from "../../../components/ui/BeninFlagBar"
import { GPSCheckInButton } from "../../../feature/teams/components/GPSCheckInButton"

interface RoleTerritorialNavbarProps {
  currentUser: User | null
  spaceSubtitle: string
  displayRole: string
  perimeterHint?: string
  onMenuOpen: () => void
}

const RoleTerritorialNavbar = ({
  currentUser,
  spaceSubtitle,
  displayRole,
  perimeterHint = "Périmètre territorial",
  onMenuOpen,
}: RoleTerritorialNavbarProps) => (
  <header className="h-16 bg-white border-b border-gray-100 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
    <div className="flex items-center gap-3 flex-1 min-w-0">
      <button
        onClick={onMenuOpen}
        className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors shrink-0"
        aria-label="Ouvrir le menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex flex-col text-left shrink-0 border-r border-gray-200 pr-4">
        <span className="text-sm font-medium text-black hidden sm:block">République du Bénin</span>
        <span className="text-sm font-medium text-emerald-700 sm:hidden">HSE TERRA</span>
        <span className="text-sm font-medium text-gray-500 leading-none mt-1 hidden sm:block">
          {spaceSubtitle}
        </span>
      </div>

      <div className="relative w-full max-w-sm hidden md:block">
        <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Rechercher signalement, zone, ouvrage..."
          className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-10 pr-4 text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500/80 transition-all text-gray-900"
        />
      </div>
    </div>

    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
      <div className="hidden lg:flex flex-col text-right mr-2">
        <span className="text-sm font-medium text-gray-650 leading-none">{perimeterHint}</span>
        <span className="text-sm font-medium text-gray-500 leading-none mt-1">Supervision HSE</span>
      </div>

      <div
        className="overflow-hidden rounded-md border border-gray-200 shadow-sm shrink-0"
        title="République du Bénin"
      >
        <BeninFlagBar size="sm" withShadow={false} className="w-10 sm:w-12" />
      </div>

      <GPSCheckInButton variant="icon" />

      <button
        type="button"
        className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-50 rounded-xl transition-all relative cursor-pointer"
        aria-label="Notifications"
      >
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-600 rounded-full" />
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      <span className="w-px h-6 bg-gray-200 hidden sm:block" />

      {currentUser && (
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-medium text-sm cursor-pointer border border-gray-200 shrink-0">
            {currentUser.firstName ? currentUser.firstName[0] : "U"}
            {currentUser.lastName ? currentUser.lastName[0] : ""}
          </div>
          <div className="text-left hidden lg:block">
            <p className="text-sm font-medium text-black leading-tight">
              {currentUser.firstName || "Utilisateur"} {currentUser.lastName || ""}
            </p>
            <p className="text-sm text-gray-500 font-medium mt-0.5">{displayRole}</p>
          </div>
        </div>
      )}
    </div>
  </header>
)

export default RoleTerritorialNavbar
