import { useMemo, useState } from "react"
import { useAppDispatch } from "../../../stores/hooks"
import { updateReport as updateReportStatus } from "../../../feature/reports/services/reports.thunk"
import { FieldReportStatus } from "../../../feature/reports/services/reports.types"
import type { TechnicianReport } from "../../../feature/reports/services/reports.types"
import { StatusBadge } from "../../../feature/reports/components/StatusBadge"
import { CategoryBadge } from "../../../feature/reports/components/CategoryBadge"
import { useTerritorialReports } from "./useTerritorialReports"
import TerritorialEmptyState from "./TerritorialEmptyState"
import { CreateMissionModal } from "../../../feature/missions/components/CreateMissionModal"
import { createMission } from "../../../feature/missions/services/missions.thunk"
import { MissionType, PriorityLevel } from "../../../feature/missions/services/missions.types";
import type { CreateMissionDTO } from "../../../feature/missions/services/missions.types"
import {
  HelpCircle,
  ImageOff,
  Loader2,
  MapPin,
  RefreshCcw,
  Search,
  Waves,
  Trash2,
  TrafficCone,
  X,
  Zap,
  Droplets,
  Briefcase
} from "lucide-react"

const CategoryIcon = ({ category, className = "w-5 h-5" }: { category: string; className?: string }) => {
  switch (category) {
    case "drainage":
      return <Waves className={className} />
    case "waste":
      return <Trash2 className={className} />
    case "road":
      return <TrafficCone className={className} />
    case "flooding":
      return <Droplets className={className} />
    case "lighting":
      return <Zap className={className} />
    default:
      return <HelpCircle className={className} />
  }
}

const categoryColorMap: Record<string, string> = {
  drainage: "bg-blue-50 text-blue-600",
  waste: "bg-stone-50 text-stone-600",
  road: "bg-orange-50 text-orange-600",
  flooding: "bg-sky-50 text-sky-600",
  lighting: "bg-yellow-50 text-yellow-600",
  other: "bg-gray-50 text-gray-500",
}

const statusLabels: Record<string, string> = {
  all: "Tous",
  submitted: "Soumis",
  assigned: "Assignés",
  in_progress: "En cours",
  resolved: "Résolus",
  validated: "Validés",
}

export const mapCategoryToMissionType = (category: string): MissionType => {
  switch (category) {
    case 'drainage': return MissionType.DRAIN_CLEANING;
    case 'waste': return MissionType.WASTE_COLLECTION;
    case 'road': return MissionType.ROAD_REPAIR;
    case 'flooding': return MissionType.FLOOD_RESPONSE;
    case 'lighting': return MissionType.MAINTENANCE;
    default: return MissionType.INSPECTION;
  }
};

const TerritorialReportsList = () => {
  const dispatch = useAppDispatch()
  const { reports, isLoading, error, refresh } = useTerritorialReports()
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReport, setSelectedReport] = useState<TechnicianReport | null>(null)
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false)

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchStatus = statusFilter === "all" || r.status === statusFilter
      const matchSearch =
        !searchQuery ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [reports, statusFilter, searchQuery])

  const handleStatusChange = async (id: string, status: FieldReportStatus) => {
    await dispatch(updateReportStatus({ id, data: { status } }))
    refresh()
    setSelectedReport(null)
  }

  const handleCreateMission = async (data: CreateMissionDTO) => {
    await dispatch(createMission(data)).unwrap()
    if (selectedReport) {
      // Mettre à jour le statut du signalement à "assigné" puisqu'une mission a été créée
      await dispatch(updateReportStatus({ id: selectedReport.id, data: { status: FieldReportStatus.ASSIGNED } }))
    }
    refresh()
    setIsMissionModalOpen(false)
    setSelectedReport(null)
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          Impossible de charger les signalements : {String(error)}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="text-sm text-gray-500 flex-1">
          {isLoading
            ? "Chargement…"
            : `${reports.length} signalement${reports.length !== 1 ? "s" : ""} sur le périmètre · ${filtered.length} affiché${filtered.length !== 1 ? "s" : ""}`}
        </p>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Actualiser
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par titre, zone, description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/20 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {Object.entries(statusLabels).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                statusFilter === key
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="text-sm font-medium">Chargement des signalements…</span>
        </div>
      ) : !filtered.length ? (
        <TerritorialEmptyState
          title="Aucun signalement sur le périmètre"
          description="Les remontées terrain apparaîtront ici dès qu'elles seront enregistrées par les équipes."
          icon={<HelpCircle className="w-10 h-10" />}
          actionLabel="Accéder aux opérations terrain"
          actionPageId="fieldOps"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => (
            <button
              key={report.id}
              type="button"
              onClick={() => setSelectedReport(report)}
              className="w-full text-left bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4 hover:border-emerald-200 hover:shadow-sm transition-all"
            >
              {(report.photoUrl || report.photoBase64) ? (
                <div className="shrink-0 w-full sm:w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                  <img src={report.photoUrl || report.photoBase64} alt="preuve terrain" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className={`shrink-0 w-20 h-20 rounded-xl flex items-center justify-center ${categoryColorMap[report.issueCategory] ?? "bg-gray-50 text-gray-400"}`}
                >
                  <CategoryIcon category={report.issueCategory} className="w-8 h-8" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <CategoryBadge category={report.issueCategory} />
                  <StatusBadge status={report.status} />
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                {report.description && (
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{report.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400 font-medium">
                  {report.latitude != null && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}
                    </span>
                  )}
                  <span>
                    {new Date(report.createdAt).toLocaleDateString("fr-BJ", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedReport && !isMissionModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Détail du signalement</h3>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {(selectedReport.photoUrl || selectedReport.photoBase64) ? (
                <img
                  src={selectedReport.photoUrl || selectedReport.photoBase64}
                  alt="preuve terrain"
                  className="w-full h-52 object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-40 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center gap-2 text-gray-300">
                  <ImageOff className="w-8 h-8" />
                  <p className="text-sm font-medium">Aucune photo disponible</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">Titre</p>
                <p className="text-sm font-medium text-gray-900">{selectedReport.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Catégorie</p>
                  <CategoryBadge category={selectedReport.issueCategory} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-1">Statut</p>
                  <StatusBadge status={selectedReport.status} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4">
                <button
                  onClick={() => setIsMissionModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-medium text-sm py-2.5 rounded-xl hover:bg-emerald-500 transition-colors shadow-sm mb-3"
                >
                  <Briefcase className="w-4 h-4" />
                  Transformer en mission (Assigner équipe)
                </button>

                <p className="text-sm font-medium text-gray-400 mb-1 text-center">Ou Mettre à jour le statut manuellement</p>
                <select
                  value={selectedReport.status}
                  onChange={(e) =>
                    handleStatusChange(selectedReport.id, e.target.value as FieldReportStatus)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-800"
                >
                  {Object.values(FieldReportStatus).map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMissionModalOpen && selectedReport && (
        <CreateMissionModal
          onClose={() => setIsMissionModalOpen(false)}
          onSubmit={handleCreateMission}
          initialData={{
            title: `Résolution: ${selectedReport.title}`,
            description: `Mission créée depuis le signalement: ${selectedReport.description || ""}`,
            missionType: mapCategoryToMissionType(selectedReport.issueCategory),
            priorityLevel: PriorityLevel.HIGH,
            municipalityId: (selectedReport as any).territory?.municipalityId,
          }}
        />
      )}
    </div>
  )
}

export default TerritorialReportsList

