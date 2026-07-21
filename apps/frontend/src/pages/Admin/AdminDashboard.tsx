import { useState, type FormEvent, useMemo } from "react"
import { Navigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../stores/hooks"
import { registerThunk, logoutThunk } from "../../feature/auth/services/auth.thunk"
import { selectAuthLoading, selectAuthError, selectCurrentUser, selectIsAuthenticated } from "../../feature/auth/services/auth.selectors"
import { clearError } from "../../feature/auth/services/auth.slice"
import { User_Role } from "../../feature/auth/services/auth.types"
import type { CreateUserDTO } from "../../feature/auth/services/auth.types"
import { useAuthRoles } from "../../feature/auth/hooks/useAuthRoles"
import { getDefaultRouteForRoles, getRoleFolderForRoles } from "../shared/rolePages.config"
import type { TerritoryFormValues } from "../../feature/territory/services/territory.types"
import { FieldReportStatus } from "../../feature/reports/services/reports.types"

import BeninFlagBar from "../../components/ui/BeninFlagBar"
import AdminNavbar from "../../components/navbar/AdminNavbar"
import AdminMap from "../../feature/admin/components/AdminMap"
import AdminVisuals from "../../feature/admin/components/AdminVisuals"
import AdminStats from "../../feature/admin/components/AdminStats"
import { MissionsDashboard } from "../../feature/missions/components/MissionsDashboard"
import UserTable from "../../feature/admin/components/UserTable"
import CreateUserDrawer from "../../feature/admin/components/CreateUserDrawer"
import UnifiedSidebar from "../../components/sidebar/UnifiedSidebar"
import { useAdminDashboardData } from "../../feature/admin/hooks/useAdminDashboardData"

// Onglets de navigation (style Jampack — labels en français)
const TABS = [
  { id: "apercu",      label: "Aperçu" },
  { id: "operations",  label: "Opérations" },
  { id: "missions",    label: "Missions" },
] as const
type Tab = (typeof TABS)[number]["id"]

const AdminDashboard = () => {
  const dispatch = useAppDispatch()
  const currentAdmin = useAppSelector(selectCurrentUser)
  const isRegistering = useAppSelector(selectAuthLoading)
  const registerError = useAppSelector(selectAuthError)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const { roles, isSuperAdmin, hasAdminAccess } = useAuthRoles()
  const { stats } = useAdminDashboardData()

  const [statusFilter, setStatusFilter] = useState("Tous")

  // ── Role tiers ──────────────────────────────────────────────────────────
  const isPlatformManager = isSuperAdmin || roles.includes(User_Role.PLATFORM_ADMIN)
  const isTerritorialManager =
    hasAdminAccess ||
    [User_Role.MINISTRY, User_Role.PREFECTURE_DIRECTOR, User_Role.MAYOR, User_Role.DST_MANAGER, User_Role.SGDS_MANAGER].some(
      (r) => roles.includes(r)
    )
  const isFieldAgent =
    [User_Role.SUPERVISOR, User_Role.TEAM_LEADER, User_Role.TECHNICIAN].some((r) => roles.includes(r)) &&
    !isTerritorialManager

  // ── UI State ─────────────────────────────────────────────────────────────
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>("apercu")

  const [form, setForm] = useState<CreateUserDTO>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: User_Role.TECHNICIAN,
  })

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (isFieldAgent) return <Navigate to={getDefaultRouteForRoles(roles)} replace />
  const dedicatedFolder = getRoleFolderForRoles(roles)
  if (dedicatedFolder && dedicatedFolder.routePrefix !== "platform" && !isPlatformManager) {
    return <Navigate to={getDefaultRouteForRoles(roles)} replace />
  }

  // ── KPIs calculés depuis les vraies données ────────────────────────────
  const reportStats = useMemo(() => {
    const reports = stats.reports ?? []
    return {
      total: reports.length,
      submitted: reports.filter((r) => r.status === FieldReportStatus.SUBMITTED).length,
      inProgress: reports.filter((r) => r.status === FieldReportStatus.IN_PROGRESS).length,
      resolved: reports.filter((r) =>
        r.status === FieldReportStatus.RESOLVED || r.status === FieldReportStatus.VALIDATED
      ).length,
    }
  }, [stats.reports])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    dispatch(logoutThunk())
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === "role") {
        next.regionId = undefined
        next.municipalityId = undefined
        next.districtId = undefined
        next.neighborhoodId = undefined
      }
      return next
    })
  }
  const handleTerritoryChange = (patch: Partial<TerritoryFormValues>) => {
    setForm((prev) => {
      const next = { ...prev }
      if (patch.regionId !== undefined) next.regionId = patch.regionId || undefined
      if (patch.municipalityId !== undefined) next.municipalityId = patch.municipalityId || undefined
      if (patch.districtId !== undefined) next.districtId = patch.districtId || undefined
      if (patch.neighborhoodId !== undefined) next.neighborhoodId = patch.neighborhoodId || undefined
      return next
    })
  }
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    setSuccessMessage(null)
    const resultAction = await dispatch(registerThunk(form))
    if (registerThunk.fulfilled.match(resultAction)) {
      setSuccessMessage(`Compte de ${form.firstName} ${form.lastName} créé avec succès !`)
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: User_Role.TECHNICIAN,
        regionId: undefined,
        municipalityId: undefined,
      })
      setTimeout(() => {
        setIsDrawerOpen(false)
        setSuccessMessage(null)
      }, 3000)
    }
  }

  // ── Date affichée (style Jampack) ─────────────────────────────────────────
  const today = new Date()
  const dateLabel = today.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })

  // ── Titre du dashboard selon le rôle ─────────────────────────────────────
  const dashboardTitle = isPlatformManager
    ? "Welcome back"
    : roles.includes(User_Role.MINISTRY)
    ? "Vue Nationale"
    : roles.includes(User_Role.PREFECTURE_DIRECTOR)
    ? "Vue Préfectorale"
    : roles.includes(User_Role.MAYOR)
    ? "Tableau Communal"
    : "Vue Territoriale"

  const dashboardSubtitle = isPlatformManager
    ? "Gérez la plateforme, les utilisateurs et consultez les statistiques."
    : "Consultez les indicateurs de votre périmètre territorial."

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 flex flex-col antialiased">
      {/* Barre drapeau Bénin */}
      <BeninFlagBar size="lg" className="sticky top-0 z-50 w-full" />

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <UnifiedSidebar
          currentUser={currentAdmin}
          onLogout={handleLogout}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Contenu principal */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminNavbar currentAdmin={currentAdmin} onMenuOpen={() => setIsSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">

            {/* ── En-tête style Jampack ───────────────────────────────── */}
            <div className="mb-6">
              {/* Ligne titre + date + bouton */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                {/* Titre & sous-titre */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{dashboardTitle}</h1>
                  <p className="text-base text-gray-500 mt-1">{dashboardSubtitle}</p>
                </div>

                {/* Actions droite */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Sélecteur de date (mock style Jampack) */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden sm:inline">{dateLabel} — Aujourd'hui</span>
                    <span className="sm:hidden">Aujourd'hui</span>
                  </div>

                  {/* Bouton ajouter un compte */}
                  {isPlatformManager && (
                    <button
                      onClick={() => setIsDrawerOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium text-sm transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="hidden sm:inline">Ajouter un compte</span>
                      <span className="sm:hidden">Ajouter</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Onglets de navigation */}
              <div className="flex items-center gap-0 border-b border-gray-200">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-base font-medium transition-colors border-b-2 -mb-px ${
                      activeTab === tab.id
                        ? "text-teal-600 border-teal-600"
                        : "text-gray-500 border-transparent hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ════════════════════════════════════════════════════
                APERÇU — Graphiques + KPIs + Carte en grand
                Contenu : AdminVisuals → AdminStats → AdminMap
            ═══════════════════════════════════════════════════ */}
            {activeTab === "apercu" && (
              <div className="space-y-6">

                {/* 1. Graphiques : Audience Overview + Returning Customers */}
                <AdminVisuals stats={stats} />

                {/* 2. KPI cards */}
                <AdminStats stats={stats} />

                {/* 3. Carte SIG en grand — style "Active users" Jampack */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                  {/* En-tête */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-800">Utilisateurs actifs</h2>
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      Carte en temps réel
                    </button>
                  </div>

                  {/* Corps : carte (gauche) + stats par région (droite) */}
                  <div className="flex flex-col xl:flex-row">

                    {/* ── Carte SIG grande ── */}
                    <div className="flex-1 h-[520px] xl:h-[600px] flex flex-col">
                      <AdminMap simpleMode />
                    </div>

                    {/* ── Panneau droite : répartition régionale ── */}
                    <div className="xl:w-80 flex-shrink-0 border-t xl:border-t-0 xl:border-l border-gray-100 p-6 flex flex-col gap-5">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Répartition par région</h3>

                      {(() => {
                        const total = stats.reports.length;
                        if (total === 0) return <div className="text-sm text-gray-500">Aucune donnée</div>;
                        const counts: Record<string, number> = {};
                        stats.reports.forEach(r => {
                          const region = r.regionName || 'Non spécifié';
                          counts[region] = (counts[region] || 0) + 1;
                        });
                        const colors = ["#0f766e", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#8b5cf6", "#ec4899", "#f59e0b"];
                        const regionDistribution = Object.entries(counts)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 5)
                          .map(([name, count], idx) => ({
                            name,
                            pct: Math.round((count / total) * 100),
                            color: colors[idx % colors.length]
                          }));

                        return regionDistribution.map((region) => (
                          <div key={region.name} className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: region.color }}
                            >
                              {region.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-sm font-semibold text-gray-700 truncate">{region.name}</span>
                                <span className="text-sm font-bold text-gray-500 ml-2 flex-shrink-0">{region.pct}%</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{ width: `${region.pct}%`, backgroundColor: region.color }}
                                />
                              </div>
                            </div>
                          </div>
                        ));
                      })()}

                      <div className="mt-auto pt-5 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-400">Total signalements</span>
                          <span className="text-base font-bold text-gray-900">{reportStats.total}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-sm font-medium text-gray-400">Résolus</span>
                          <span className="text-base font-bold text-emerald-600">{reportStats.resolved}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-sm font-medium text-gray-400">En cours</span>
                          <span className="text-base font-bold text-blue-600">{reportStats.inProgress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ════════════════════════════════════════════════════
                OPÉRATIONS — Gestion des comptes utilisateurs
                Contenu : UserTable (plateforme admin uniquement)
            ═══════════════════════════════════════════════════ */}
            {activeTab === "operations" && (
              <div className="space-y-6">

                {isPlatformManager ? (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* En-tête tableau */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold text-gray-800">Signalements (Détails)</h2>
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">
                          {reportStats.total}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Importer
                        </button>
                        <button
                          onClick={() => setIsDrawerOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                          </svg>
                          Nouveau
                        </button>
                      </div>
                    </div>
                    {/* Sous-onglets */}
                    <div className="flex items-center gap-0 px-5 border-b border-gray-100">
                      {["Tous", "Actifs", "Inactifs"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setStatusFilter(t)}
                          className={`px-3 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                            statusFilter === t
                              ? "text-teal-600 border-teal-600"
                              : "text-gray-500 border-transparent hover:text-gray-700"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="p-4">
                      <UserTable searchTerm={searchTerm} setSearchTerm={setSearchTerm} statusFilter={statusFilter} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-gray-500">Accès réservé aux administrateurs plateforme</p>
                  </div>
                )}

              </div>
            )}

            {/* ════════════════════════════════════════════════════
                MISSIONS — Suivi des missions terrain
                Contenu : MissionsDashboard (Kanban + création)
            ═══════════════════════════════════════════════════ */}
            {activeTab === "missions" && (
              <div className="space-y-0">
                <MissionsDashboard />
              </div>
            )}

          </main>
        </div>
      </div>

      {/* Drawer création de compte */}
      {isPlatformManager && (
        <CreateUserDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false)
            dispatch(clearError())
            setSuccessMessage(null)
          }}
          form={form}
          onChange={handleChange}
          onTerritoryChange={handleTerritoryChange}
          onSubmit={handleSubmit}
          isLoading={isRegistering}
          error={registerError}
          successMessage={successMessage}
        />
      )}
    </div>
  )
}

export default AdminDashboard