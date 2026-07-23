import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { useAuthRoles } from "../../../feature/auth/hooks/useAuthRoles"
import { buildRolePath } from "../rolePages.config"
import type { RolePageId } from "../rolePages.config"
import { useTerritorialReports } from "./useTerritorialReports"
import TerritorialOverview from "./TerritorialOverview"
import TerritorialEmptyState from "./TerritorialEmptyState"
import { StatusBadge } from "../../../feature/reports/components/StatusBadge"
import { CategoryBadge } from "../../../feature/reports/components/CategoryBadge"
import { IssueCategory } from "../../../feature/reports/services/reports.types"
import { getScopeForFolder } from "./roleScopeLabels"

interface DemoItem {
  id: string
  title: string
  zone: string
  status: string
}

interface TerritorialPanelProps {
  folder: string
  intro: string
  category?: IssueCategory
  demoItems?: DemoItem[]
  relatedLinks?: { pageId: RolePageId; label: string }[]
  children?: ReactNode
}

const TerritorialPanel = ({
  folder,
  intro,
  category,
  demoItems = [],
  relatedLinks = [],
  children,
}: TerritorialPanelProps) => {
  const { roles } = useAuthRoles()
  const { reports, isLoading, stats } = useTerritorialReports()
  const scope = getScopeForFolder(folder)

  const filtered = category
    ? reports.filter((r) => r.issueCategory === category)
    : reports

  const kpiValue = category
    ? reports.filter((r) => r.issueCategory === category).length
    : stats.total

  return (
    <div className="space-y-5">
      <TerritorialOverview
        scopeLabel={scope.scopeLabel}
        perimeterTag={scope.perimeterTag}
      />

      <div className="bg-emerald-50/50 border border-emerald-100/50 rounded px-4 py-3">
        <p className="text-sm font-medium text-emerald-800">
          {intro}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 bg-white border border-gray-200 rounded  overflow-hidden">
        <div className="p-5">
          <p className="text-sm font-medium text-gray-500">Signalements liés</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{isLoading ? "…" : kpiValue}</p>
        </div>
        <div className="p-5">
          <p className="text-sm font-medium text-gray-500">En attente</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{isLoading ? "…" : stats.pending}</p>
        </div>
        <div className="p-5 col-span-2 sm:col-span-1 border-t sm:border-t-0 bg-gray-50/30">
          <p className="text-sm font-medium text-gray-500">Résolus</p>
          <p className="text-2xl font-semibold text-emerald-600 mt-1">{isLoading ? "…" : stats.resolved}</p>
        </div>
      </div>

      {children}

      {filtered.length > 0 && (
        <section className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Signalements associés</h3>
            <Link
              to={buildRolePath(roles, "agentReports")}
              className="text-sm font-medium text-emerald-700 hover:underline flex items-center gap-1"
            >
              Tout voir <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-50">
            {filtered.slice(0, 5).map((r) => (
              <li key={r.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {new Date(r.createdAt).toLocaleDateString("fr-BJ")}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <CategoryBadge category={r.issueCategory} />
                  <StatusBadge status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {demoItems.length > 0 && (
        <section className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">Suivi opérationnel (aperçu)</h3>
            <p className="text-sm text-gray-400 mt-0.5">Données de démonstration en attendant le branchement API complet</p>
          </div>
          <ul className="divide-y divide-gray-50">
            {demoItems.map((item) => (
              <li key={item.id} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{item.zone}</p>
                </div>
                <span className="text-sm font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!filtered.length && !demoItems.length && !children && (
        <TerritorialEmptyState
          title="Aucune donnée pour ce module"
          description="Les indicateurs s'alimenteront automatiquement lorsque des signalements correspondants seront enregistrés."
          actionPageId="fieldOps"
        />
      )}

      {relatedLinks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {relatedLinks.map((link) => (
            <Link
              key={link.pageId}
              to={buildRolePath(roles, link.pageId)}
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl hover:bg-emerald-100"
            >
              {link.label} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default TerritorialPanel
