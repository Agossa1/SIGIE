import { useMemo, useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../../stores/hooks"
import { fetchReports } from "../../reports/services/reports.thunk"
import { selectAllReports } from "../../reports/services/reports.selectors"
import { ReportDetailsModal } from "../../reports/components/ReportDetailsModal"
import { StatusBadge } from "../../reports/components/StatusBadge"
import { CategoryBadge } from "../../reports/components/CategoryBadge"

interface UserTableProps {
  searchTerm: string
  setSearchTerm: (val: string) => void
  statusFilter?: string
}

const UserTable = ({ searchTerm, setSearchTerm, statusFilter = "Tous" }: UserTableProps) => {
  const [activeTab, setActiveTab] = useState<"reports" | "missions">("reports")
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  const dispatch = useAppDispatch()
  const reports = useAppSelector(selectAllReports) ?? []
  const missions: any[] = []

  useEffect(() => {
    dispatch(fetchReports()).catch(() => {})
    // fetchMissions() désactivé — module non migré
  }, [dispatch])

  // ── Données réelles : Signalements récents ──────────────────────────────────
  const latestFieldReports = reports.map(r => ({
    id: r.id,
    author: r.creator
      ? `${r.creator.firstName ?? ''} ${r.creator.lastName ?? ''}`.trim() || r.creator.email || 'Agent'
      : 'Agent Terrain',
    role: r.creator?.roleCode ?? 'Agent terrain',
    issue: r.title || r.description?.substring(0, 50) || 'Signalement',
    date: new Date(r.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    category: r.issueCategory,
    priority: r.priority ?? 'medium',
    status: r.status,
  }))

  const displayedReports = latestFieldReports.filter(r => {
    const matchSearch = (
      r.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    let matchStatus = true;
    if (statusFilter === "Actifs") {
       matchStatus = ["submitted", "assigned", "in_progress"].includes(r.status);
    } else if (statusFilter === "Inactifs") {
       matchStatus = ["resolved", "validated", "rejected"].includes(r.status);
    }

    return matchSearch && matchStatus;
  })

  // ── Données réelles : Top Performers (basés sur les missions complétées) ────
  const topPerformers = useMemo(() => {
    // Grouper les missions par équipe assignée et compter
    const counts: Record<string, { name: string; count: number }> = {}

    missions.forEach(m => {
      const key = m.assignedTeamId ?? m.createdBy ?? 'unknown'
      const name = m.assignedTeamName ?? m.createdBy ?? 'Équipe inconnue'
      if (!counts[key]) {
        counts[key] = { name, count: 0 }
      }
      counts[key].count += 1
    })

    // Trier par nombre de missions décroissant, garder top 3
    return Object.entries(counts)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 3)
      .map(([id, { name, count }], index) => ({
        id: id + index,
        name,
        count,
      }))
  }, [missions])

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "emergency": return "bg-red-50 text-red-700 border-red-100"
      case "critical":  return "bg-rose-50 text-rose-700 border-rose-100"
      case "high":      return "bg-amber-50 text-amber-700 border-amber-100"
      default:          return "bg-gray-50 text-gray-600 border-gray-200"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "emergency": return "Urgent absolu"
      case "critical":  return "Critique"
      case "high":      return "Prioritaire"
      default:          return "Normale"
    }
  }

  const initials = (name: string) => {
    const parts = name.trim().split(' ')
    return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

      {/* 1. Tableau principal */}
      <div className="lg:col-span-8 bg-white border border-gray-100 rounded overflow-hidden flex flex-col">

        {/* En-tête */}
        <div className="border-b border-gray-100 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">

          {/* Onglets */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab("reports")}
              className={`pb-2.5 text-sm font-medium relative transition-all cursor-pointer ${
                activeTab === "reports"
                  ? "text-emerald-600 border-b-2 border-emerald-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Derniers Signalements
              <span className={`ml-2 px-2 py-0.5 rounded-full text-sm font-medium ${
                activeTab === "reports" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {reports.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("missions")}
              className={`pb-2.5 text-sm font-medium relative transition-all cursor-pointer ${
                activeTab === "missions"
                  ? "text-emerald-600 border-b-2 border-emerald-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              Missions Récentes
              <span className="ml-2 px-2 py-0.5 rounded-full text-sm font-medium bg-gray-100 text-gray-400">
                {missions.length}
              </span>
            </button>
          </div>

          {/* Recherche */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Filtrer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-50 border border-gray-100 rounded-xl py-1.5 pl-9 pr-3 text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500/80 transition-all text-gray-700 w-36 font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/40 text-gray-600 text-sm font-semibold">
                <th className="py-4 px-4 sm:px-6 font-semibold">Signalement / Auteur</th>
                <th className="py-4 px-4 sm:px-6 font-semibold whitespace-nowrap">Date</th>
                <th className="py-4 px-4 sm:px-6 font-semibold whitespace-nowrap">Catégorie</th>
                <th className="py-4 px-4 sm:px-6 font-semibold whitespace-nowrap">Priorité</th>
                <th className="py-4 px-4 sm:px-6 font-semibold whitespace-nowrap">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {displayedReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 text-sm">
                    Aucun signalement trouvé
                  </td>
                </tr>
              ) : displayedReports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-gray-50/30 transition-all duration-150 group cursor-pointer"
                  onClick={() => setSelectedReportId(report.id)}
                >
                  <td className="py-4 px-4 sm:px-6 max-w-[200px] sm:max-w-none">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-medium text-emerald-600 text-sm">
                        {initials(report.author)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors truncate">
                          {report.issue}
                        </p>
                        <p className="text-sm text-gray-400 font-medium mt-0.5 sm:mt-1 truncate">
                          {report.author} · {report.role}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-gray-500 font-semibold whitespace-nowrap">{report.date}</td>
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <CategoryBadge category={report.category} />
                  </td>
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityStyle(report.priority)}`}>
                      {getPriorityLabel(report.priority)}
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                    <StatusBadge status={report.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Top Performers (données réelles) */}
      <div className="lg:col-span-4 bg-white border border-gray-100 rounded p-6 flex flex-col justify-between min-h-[320px]">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-medium text-black">Équipes les plus actives</h3>
            <span className="text-gray-400 text-sm">{missions.length} missions</span>
          </div>

          {topPerformers.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Aucune donnée disponible</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={performer.id} className="flex items-center justify-between p-2 hover:bg-gray-50/50 rounded-xl transition-all duration-200 group">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {/* Rang */}
                    <span className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-600' :
                      index === 1 ? 'bg-gray-100 text-gray-500' :
                      'bg-orange-50 text-orange-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-medium text-sm">
                      {initials(performer.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-black group-hover:text-blue-600 transition-colors truncate">
                        {performer.name}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-2 text-right">
                    <span className="text-sm font-medium text-gray-800 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1 block whitespace-nowrap">
                      {performer.count} mission{performer.count > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      {selectedReportId && (
        <ReportDetailsModal
          isOpen={!!selectedReportId}
          onClose={() => setSelectedReportId(null)}
          report={reports.find(r => r.id === selectedReportId)!}
        />
      )}

    </div>
  )
}

export default UserTable
