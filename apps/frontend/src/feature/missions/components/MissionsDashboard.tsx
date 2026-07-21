import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../../stores/hooks"
import { MissionStatus } from "../services/missions.types"
import type { CreateMissionDTO } from "../services/missions.types"
import { CreateMissionModal } from "./CreateMissionModal"
import { MissionDetailsModal } from "./MissionDetailsModal"
import { MissionsKanban } from "./MissionsKanban"
import { fetchMissions, createMission, updateMissionStatus } from "../services/missions.thunk"
import { selectAllMissions, selectMissionsLoading } from "../services/missions.selectors"
import { useAuthRoles } from "../../auth/hooks/useAuthRoles"
import { User_Role } from "../../auth/services/auth.types"

export const MissionsDashboard = () => {
  const dispatch = useAppDispatch()
  const missions = useAppSelector(selectAllMissions) ?? []
  const loading = useAppSelector(selectMissionsLoading)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban')
  const { roles, hasAdminAccess } = useAuthRoles();
  const isFieldAgent = roles.includes('field_agent' as any) || roles.includes(User_Role.TECHNICIAN) || (!hasAdminAccess && !roles.includes(User_Role.SUPERVISOR as any));

  useEffect(() => {
    dispatch(fetchMissions())
  }, [dispatch])

  const handleCreateMission = async (data: CreateMissionDTO) => {
    await dispatch(createMission(data)).unwrap()
    dispatch(fetchMissions())
    setIsCreateModalOpen(false)
  }

  const handleStatusChange = async (id: string, newStatus: MissionStatus) => {
    try {
      await dispatch(updateMissionStatus({ id, status: newStatus })).unwrap()
      dispatch(fetchMissions())
    } catch (error: any) {
      if (error?.errors?.hasActiveInterventions) {
        if (window.confirm("Des interventions sont toujours en cours sur cette mission.\\n\\nVoulez-vous toutes les clôturer automatiquement pour pouvoir terminer la mission ?")) {
          try {
            await dispatch(updateMissionStatus({ id, status: newStatus, forceCompleteInterventions: true })).unwrap()
            dispatch(fetchMissions())
          } catch (e: any) {
            console.error("Failed to force update status", e)
            alert(e?.message || "Erreur lors de la mise à jour du statut")
          }
        }
      } else {
        console.error("Failed to update status", error)
        alert(error?.message || "Erreur lors de la mise à jour du statut")
      }
    }
  }

  const getStatusBadge = (status: MissionStatus, isOverdue?: boolean) => {
    let badge = null;
    switch (status) {
      case MissionStatus.DRAFT:
        badge = <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">Brouillon</span>;
        break;
      case MissionStatus.ASSIGNED:
        badge = <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">Assignée</span>;
        break;
      case MissionStatus.IN_PROGRESS:
        badge = <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">En cours</span>;
        break;
      case MissionStatus.COMPLETED:
        badge = <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">Terminée</span>;
        break;
      default:
        badge = <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">{status}</span>;
    }
    
    return (
      <div className="flex flex-col gap-1 items-start">
        {badge}
        {isOverdue && (
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200 shadow-sm whitespace-nowrap">
            En retard
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <button 
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            Vue Kanban
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'list' ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
          >
            Vue Liste
          </button>
        </div>

        {!isFieldAgent && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors shadow-sm"
          >
            + Nouvelle mission
          </button>
        )}
      </div>

      {viewMode === 'kanban' ? (
        <MissionsKanban 
          missions={missions} 
          onStatusChange={handleStatusChange} 
          onMissionClick={setSelectedMissionId}
          isReadOnly={isFieldAgent}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-sm font-medium text-gray-900">Registre des Missions</h3>
          </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-sm font-medium text-gray-400">Chargement des missions...</div>
          ) : missions.length === 0 ? (
            <div className="p-12 text-center text-sm font-medium text-gray-400">Aucune mission trouvée.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm font-medium text-gray-400 bg-gray-50/30">
                  <th className="px-6 py-3">Mission</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Priorité</th>
                  <th className="px-6 py-3">Équipe Assignée</th>
                  <th className="px-6 py-3">Statut</th>
                  <th className="px-6 py-3">Date de création</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {missions.map((mission) => (
                  <tr key={mission.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{mission.title}</div>
                      {mission.description && <div className="text-sm text-gray-500 mt-0.5 truncate max-w-[200px]">{mission.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-600">{mission.missionType.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-medium ${mission.priorityLevel === 'high' || mission.priorityLevel === 'critical' || mission.priorityLevel === 'emergency' ? 'text-red-600' : 'text-gray-500'}`}>
                        {mission.priorityLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700">
                        {mission.assignedTeamName || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(mission.status, mission.isOverdue)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500">
                      {new Date(mission.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                      {!isFieldAgent && (
                        <select 
                          className="text-sm border border-gray-200 rounded px-2 py-1 bg-white cursor-pointer"
                          value={mission.status}
                          onChange={(e) => handleStatusChange(mission.id, e.target.value as MissionStatus)}
                        >
                          {Object.values(MissionStatus).map(status => (
                            <option key={status} value={status}>{status.replace(/_/g, ' ').toUpperCase()}</option>
                          ))}
                        </select>
                      )}
                      <button
                        onClick={() => setSelectedMissionId(mission.id)}
                        className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded hover:bg-emerald-100 transition-colors"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      )}

      {isCreateModalOpen && (
        <CreateMissionModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSubmit={handleCreateMission} 
        />
      )}

      {selectedMissionId && (
        <MissionDetailsModal
          missionId={selectedMissionId}
          onClose={() => setSelectedMissionId(null)}
          onRefresh={() => dispatch(fetchMissions())}
        />
      )}
    </div>
  )
}
