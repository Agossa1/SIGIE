import { useEffect, useMemo, useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../stores/hooks"
import { fetchReports } from "../../feature/reports/services/reports.thunk"
import { selectAllReports, selectReportsLoading } from "../../feature/reports/services/reports.selectors"
import { FieldReportStatus } from "../../feature/reports/services/reports.types"
import { StatusBadge } from "../../feature/reports/components/StatusBadge"
import { CategoryBadge } from "../../feature/reports/components/CategoryBadge"
import { useAuthRoles } from "../../feature/auth/hooks/useAuthRoles"
import { buildRolePath } from "../shared/rolePages.config"
import { selectCurrentUser } from "../../feature/auth/services/auth.selectors"
import TechnicianLayout from "./TechnicianLayout"
import { teamsApi } from "../../feature/teams/services/teams.api"
import {
  Plus, FileText, Waves, Trash2, TrafficCone, Zap, Droplets, HelpCircle,
  BarChart2, Clock, CheckCircle2, PenLine, MapPin, Wrench, ChevronRight,
  Activity, Navigation, Loader2
} from "lucide-react"

const CategoryIcon = ({ category, className = "w-5 h-5" }: { category: string; className?: string }) => {
  switch (category) {
    case "drainage":  return <Waves className={className} />
    case "waste":     return <Trash2 className={className} />
    case "road":      return <TrafficCone className={className} />
    case "flooding":  return <Droplets className={className} />
    case "lighting":  return <Zap className={className} />
    default:          return <HelpCircle className={className} />
  }
}

const categoryColorMap: Record<string, string> = {
  drainage: "bg-blue-50 text-blue-600",
  waste:    "bg-stone-50 text-stone-600",
  road:     "bg-orange-50 text-orange-600",
  flooding: "bg-sky-50 text-sky-600",
  lighting: "bg-yellow-50 text-yellow-600",
  other:    "bg-gray-50 text-gray-500",
}

const TechnicienDashboardPage = () => {
  const dispatch = useAppDispatch()
  const allReports = useAppSelector(selectAllReports) ?? []
  const isLoading = useAppSelector(selectReportsLoading)
  const { roles } = useAuthRoles()
  const currentUser = useAppSelector(selectCurrentUser)
  
  // Le technicien ne doit voir que ses propres signalements dans son espace
  const reports = useMemo(() => {
    if (!currentUser?.id) return []
    return allReports.filter(r => r.createdBy === currentUser.id)
  }, [allReports, currentUser])

  const userName = (currentUser as any)?.fullName || (currentUser as any)?.firstName || "Technicien"
  const userTeamId = (currentUser as any)?.teamId as string | undefined

  // ── GPS Check-in state ──
  const [checkInStatus, setCheckInStatus] = useState<"idle" | "loading" | "success" | "error" | "no_gps" | "no_team">("idle")

  const handleCheckIn = useCallback(async () => {
    if (!userTeamId) {
      setCheckInStatus("no_team")
      return
    }
    if (!navigator.geolocation) {
      setCheckInStatus("no_gps")
      return
    }
    setCheckInStatus("loading")
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await teamsApi.checkIn({
            teamId: userTeamId,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })
          setCheckInStatus("success")
          // Reset after 4s
          setTimeout(() => setCheckInStatus("idle"), 4000)
        } catch {
          setCheckInStatus("error")
          setTimeout(() => setCheckInStatus("idle"), 4000)
        }
      },
      () => {
        setCheckInStatus("error")
        setTimeout(() => setCheckInStatus("idle"), 4000)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [userTeamId])

  useEffect(() => {
    dispatch(fetchReports())
  }, [dispatch])

  const stats = useMemo(() => {
    const pending = reports.filter((r) =>
      [FieldReportStatus.SUBMITTED, FieldReportStatus.ASSIGNED, FieldReportStatus.IN_PROGRESS].includes(r.status)
    ).length
    const resolved = reports.filter((r) =>
      [FieldReportStatus.RESOLVED, FieldReportStatus.VALIDATED].includes(r.status)
    ).length
    const drafts = reports.filter((r) => r.status === FieldReportStatus.DRAFT).length
    return { total: reports.length, pending, resolved, drafts }
  }, [reports])

  const recentReports = useMemo(() => [...reports].slice(0, 6), [reports])

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    reports.forEach((r) => {
      counts[r.issueCategory] = (counts[r.issueCategory] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [reports])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir"
  const todayFormatted = new Date().toLocaleDateString("fr-BJ", {
    weekday: "long", day: "2-digit", month: "long",
  })

  return (
    <TechnicianLayout>
      <div className="space-y-6">
        {/* ── Bandeau de bienvenue ── */}
        <div className="relative bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 sm:p-6 overflow-hidden text-white">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "30px 30px"
          }} />
          <div className="relative">
            <p className="text-emerald-200 text-sm font-medium capitalize">{todayFormatted}</p>
            <h2 className="text-lg sm:text-xl font-medium mt-0.5">{greeting}, {userName}</h2>
            <p className="text-emerald-100 text-sm mt-1 font-medium">
              {stats.pending > 0
                ? `${stats.pending} signalement${stats.pending > 1 ? "s" : ""} en attente de traitement.`
                : "Tous vos signalements sont traités. Excellent travail !"}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link
                to={buildRolePath(roles, "agentReports")}
                className="inline-flex items-center gap-1.5 bg-white text-emerald-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Nouveau signalement
              </Link>
              <Link
                to={buildRolePath(roles, "agentReports")}
                className="inline-flex items-center gap-1.5 bg-emerald-700/50 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-emerald-700/70 transition-colors"
              >
                Mes rapports <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              {/* ── GPS Check-in button ── */}
              <button
                onClick={handleCheckIn}
                disabled={checkInStatus === "loading"}
                className={`inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition-colors border ${
                  checkInStatus === "success"
                    ? "bg-white text-emerald-700 border-white"
                    : checkInStatus === "error" || checkInStatus === "no_gps" || checkInStatus === "no_team"
                    ? "bg-red-500/20 border-red-300/40 text-white"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }`}
              >
                {checkInStatus === "loading" ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Localisation...</span></>
                ) : checkInStatus === "success" ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /><span>Position envoyée !</span></>
                ) : checkInStatus === "no_team" ? (
                  <><Navigation className="w-3.5 h-3.5" /><span>Aucune équipe assignée</span></>
                ) : checkInStatus === "error" || checkInStatus === "no_gps" ? (
                  <><Navigation className="w-3.5 h-3.5" /><span>GPS indisponible</span></>
                ) : (
                  <><Navigation className="w-3.5 h-3.5" /><span>Partager ma position</span></>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total,    icon: BarChart2,    color: "bg-blue-50    text-blue-700   ring-blue-200" },
            { label: "En attente", value: stats.pending, icon: Clock,      color: "bg-amber-50   text-amber-700  ring-amber-200" },
            { label: "Résolus", value: stats.resolved, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
            { label: "Brouillons", value: stats.drafts, icon: PenLine,      color: "bg-gray-50    text-gray-600   ring-gray-200" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`rounded-xl p-4 ring-1 ring-inset ${color}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium opacity-70">{label}</p>
                <Icon className="w-4 h-4 opacity-50" />
              </div>
              <p className="text-2xl font-medium">
                {isLoading
                  ? <span className="inline-block h-7 w-10 rounded-md bg-current/15 animate-pulse" aria-hidden />
                  : value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Corps principal ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Signalements récents — 2 colonnes */}
          <section className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Signalements récents</h3>
                <p className="text-sm text-gray-400 mt-0.5">Vos 6 dernières remontées terrain</p>
              </div>
              <Link to={buildRolePath(roles, "agentReports")} className="text-sm font-medium text-emerald-700 hover:underline flex items-center gap-1">
                Tout voir <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="divide-y divide-gray-50">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 sm:px-5 flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-2 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !recentReports.length ? (
              <div className="p-10 text-center">
                <FileText className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">Aucun rapport pour le moment</p>
                <p className="text-sm text-gray-400 mt-1">Créez votre premier rapport terrain.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {recentReports.map((report) => (
                  <li key={report.id} className="p-4 sm:px-5 sm:py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${categoryColorMap[report.issueCategory] ?? "bg-gray-50 text-gray-400"}`}>
                      <CategoryIcon category={report.issueCategory} className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {new Date(report.createdAt).toLocaleDateString("fr-BJ", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <CategoryBadge category={report.issueCategory} />
                      <StatusBadge status={report.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Colonne droite */}
          <div className="space-y-5">
            {/* Répartition par catégorie */}
            <section className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-medium text-gray-900">Répartition par type</h3>
              </div>
              {!categoryBreakdown.length ? (
                <p className="text-sm text-gray-400">Aucune donnée disponible.</p>
              ) : (
                <div className="space-y-3">
                  {categoryBreakdown.map(([category, count]) => (
                    <div key={category} className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${categoryColorMap[category] ?? "bg-gray-50 text-gray-400"}`}>
                        <CategoryIcon category={category} className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-medium text-gray-600 capitalize">{category}</p>
                          <p className="text-sm font-medium text-gray-900">{count}</p>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Actions rapides */}
            <section className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Actions rapides</h3>
              <div className="space-y-2">
                {[
                  { to: buildRolePath(roles, "agentReports"),    icon: MapPin,  label: "Signaler un incident",   sub: "Rapport géolocalisé avec photo", color: "bg-emerald-50 text-emerald-700" },
                  { to: buildRolePath(roles, "interventions"), icon: Wrench,  label: "Mes interventions",      sub: "Consulter le planning équipe",    color: "bg-sky-50 text-sky-700" },
                  { to: buildRolePath(roles, "agentReports"), icon: FileText, label: "Consulter mes rapports", sub: "Rechercher et filtrer",            color: "bg-gray-50 text-gray-700" },
                ].map(({ to, icon: Icon, label, sub, color }) => (
                  <Link key={to} to={to} className={`flex items-center gap-3 w-full p-3 rounded-xl hover:opacity-90 transition-opacity ${color}`}>
                    <Icon className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-sm font-medium opacity-70">{sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </TechnicianLayout>
  )
}

export default TechnicienDashboardPage
