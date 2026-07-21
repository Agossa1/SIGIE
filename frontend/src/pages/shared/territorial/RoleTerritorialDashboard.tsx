import { useMemo } from "react"
import { Link } from "react-router-dom"
import {
  AlertTriangle,
  BarChart2,
  Building2,
  ChevronRight,
  Clock,
  CloudRain,
  FileText,
  Map,
  MapPin,
  Users,
  Wrench,
} from "lucide-react"
import { useAppSelector } from "../../../stores/hooks"
import { StatusBadge } from "../../../feature/reports/components/StatusBadge"
import { CategoryBadge } from "../../../feature/reports/components/CategoryBadge"
import { useAuthRoles } from "../../../feature/auth/hooks/useAuthRoles"
import { buildRolePath } from "../rolePages.config"
import type { RoleFolderConfig } from "../rolePages.config"
import { selectCurrentUser } from "../../../feature/auth/services/auth.selectors"
import RoleTerritorialLayout from "./RoleTerritorialLayout"
import { useTerritorialReports } from "./useTerritorialReports"
import TerritorialEmptyState from "./TerritorialEmptyState"
import { getScopeForFolder } from "./roleScopeLabels"

const MOCK_ALERTS = [
  { id: "1", label: "Risque de crue — zone littorale", level: "Élevé", date: "22 mai 2026" },
  { id: "2", label: "Point d'eau stagnante — centre-ville", level: "Moyen", date: "21 mai 2026" },
  { id: "3", label: "Débordement canal — secteur est", level: "Surveillance", date: "20 mai 2026" },
]

interface RoleTerritorialDashboardProps {
  config: RoleFolderConfig
  defaultUserTitle?: string
}

const RoleTerritorialDashboard = ({ config, defaultUserTitle = "Responsable" }: RoleTerritorialDashboardProps) => {
  const { reports, isLoading, error, stats } = useTerritorialReports()
  const { roles } = useAuthRoles()
  const currentUser = useAppSelector(selectCurrentUser)
  const scope = getScopeForFolder(config.folder)

  const userName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") || defaultUserTitle

  const recentReports = useMemo(() => [...reports].slice(0, 5), [reports])
  const hasReports = reports.length > 0
  const showAlerts = config.pages.includes("alerts")
  const showGis = config.pages.includes("gisMap")
  const showSanitation = config.pages.includes("sanitation")

  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir"
  const todayFormatted = new Date().toLocaleDateString("fr-BJ", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })

  const dashboardTitle = config.dashboardTitle ?? "Tableau de bord"
  const dashboardSubtitle = `${scope.scopeLabel} — Indicateurs et vue d'ensemble de votre périmètre.`

  return (
    <RoleTerritorialLayout config={config} title={dashboardTitle} subtitle={dashboardSubtitle}>
      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            Les statistiques temps réel sont indisponibles ({String(error)}). Les autres sections restent accessibles.
          </div>
        )}

        <div className="relative bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 sm:p-6 overflow-hidden text-white">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
              backgroundSize: "30px 30px",
            }}
          />
          <div className="relative">
            <p className="text-emerald-200 text-sm font-medium capitalize">{todayFormatted}</p>
            <h3 className="text-lg sm:text-xl font-medium mt-0.5">
              {greeting}, {userName}
            </h3>
            <p className="text-emerald-100 text-sm mt-1 font-medium">
              {isLoading
                ? "Chargement des indicateurs…"
                : stats.pending > 0
                  ? `${stats.pending} signalement${stats.pending > 1 ? "s" : ""} en attente sur le périmètre.`
                  : hasReports
                    ? "Tous les signalements du périmètre sont pris en charge."
                    : "Aucun signalement enregistré pour le moment sur votre périmètre."}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link
                to={buildRolePath(roles, "agentReports")}
                className="inline-flex items-center gap-1.5 bg-white text-emerald-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" />
                Voir les signalements
              </Link>
              {showGis && (
                <Link
                  to={buildRolePath(roles, "gisMap")}
                  className="inline-flex items-center gap-1.5 bg-emerald-700/50 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-emerald-700/70 transition-colors"
                >
                  Cartographie <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Signalements", value: stats.total, icon: BarChart2, color: "bg-blue-50 text-blue-700 ring-blue-200" },
            { label: "En attente", value: stats.pending, icon: Clock, color: "bg-amber-50 text-amber-700 ring-amber-200" },
            { label: "Résolus", value: stats.resolved, icon: Wrench, color: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
            { label: "Urgents", value: stats.urgent, icon: AlertTriangle, color: "bg-rose-50 text-rose-700 ring-rose-200" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`rounded-xl p-4 ring-1 ring-inset ${color}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium opacity-70">{label}</p>
                <Icon className="w-4 h-4 opacity-50" />
              </div>
              <p className="text-2xl font-medium">
                {isLoading ? (
                  <span className="inline-block h-7 w-10 rounded-md bg-current/15 animate-pulse" aria-hidden />
                ) : (
                  value
                )}
              </p>
            </div>
          ))}
        </div>

        {showGis && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Drainage / canaux", value: stats.drainage, icon: MapPin },
              { label: "Salubrité", value: stats.waste, icon: Users },
              { label: "Voirie", value: stats.road, icon: Building2 },
              { label: "Inondations", value: stats.flooding, icon: CloudRain },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{label}</p>
                  <p className="text-lg font-medium text-gray-900">{isLoading ? "…" : value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <section className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Signalements récents</h3>
                <p className="text-sm text-gray-400 mt-0.5">Dernières remontées sur le périmètre</p>
              </div>
              <Link
                to={buildRolePath(roles, "agentReports")}
                className="text-sm font-medium text-emerald-700 hover:underline flex items-center gap-1"
              >
                Tout voir <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-sm text-gray-400 font-medium">Chargement…</div>
            ) : !recentReports.length ? (
              <div className="p-6">
                <TerritorialEmptyState
                  title="Aucun signalement récent"
                  description="Dès qu'une équipe terrain remontera un incident, il apparaîtra ici avec son statut et sa catégorie."
                  actionLabel="Consulter les opérations terrain"
                  actionPageId="fieldOps"
                />
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {recentReports.map((report) => (
                  <li
                    key={report.id}
                    className="p-4 sm:px-5 sm:py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                      <p className="text-sm text-gray-400 mt-0.5">
                        {new Date(report.createdAt).toLocaleDateString("fr-BJ", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
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

          <div className="space-y-5">
            {showAlerts && (
              <section className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CloudRain className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-medium text-gray-900">Alertes</h3>
                </div>
                <ul className="space-y-3">
                  {MOCK_ALERTS.map((alert) => (
                    <li key={alert.id} className="p-3 rounded-xl bg-sky-50/80 border border-sky-100">
                      <p className="text-sm font-medium text-gray-900">{alert.label}</p>
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-sm font-medium text-sky-700">{alert.level}</span>
                        <span className="text-sm text-gray-400">{alert.date}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <Link
                  to={buildRolePath(roles, "alerts")}
                  className="mt-3 inline-flex text-sm font-medium text-emerald-700 hover:underline"
                >
                  Gérer les alertes →
                </Link>
              </section>
            )}

            <section className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Accès rapides</h3>
              <div className="space-y-2">
                {[
                  { pageId: "fieldOps" as const, icon: MapPin, label: "Opérations terrain", sub: "Supervision des missions", color: "bg-emerald-50 text-emerald-700", show: true },
                  { pageId: "gisMap" as const, icon: Map, label: "Cartographie SIG", sub: "Couches territoriales", color: "bg-sky-50 text-sky-700", show: showGis },
                  { pageId: "sanitation" as const, icon: Building2, label: "Salubrité & collectes", sub: "Zones et planning", color: "bg-amber-50 text-amber-800", show: showSanitation },
                  { pageId: "interventions" as const, icon: Wrench, label: "Interventions", sub: "Brigades et chantiers", color: "bg-gray-50 text-gray-700", show: config.pages.includes("interventions") },
                ]
                  .filter((item) => item.show)
                  .map(({ pageId, icon: Icon, label, sub, color }) => (
                    <Link
                      key={pageId}
                      to={buildRolePath(roles, pageId)}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl hover:opacity-90 transition-opacity ${color}`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-sm font-medium opacity-70 truncate">{sub}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-40 shrink-0" />
                    </Link>
                  ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </RoleTerritorialLayout>
  )
}

export default RoleTerritorialDashboard
