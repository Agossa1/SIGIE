import { useMemo, useEffect } from "react"
import RoleTerritorialPageShell from "../RoleTerritorialPageShell"
import TerritorialOverview from "../TerritorialOverview"
import TerritorialGisMapSection from "../TerritorialGisMapSection"
import { getScopeForFolder } from "../roleScopeLabels"
import { useTerritorialReports } from "../useTerritorialReports"
import { useAppSelector, useAppDispatch } from "../../../../stores/hooks"
import { useTeamLocations } from "../../../../feature/teams/hooks/useTeamLocations"
import type { IncidentPin, MissionPin, TeamLocation, InterventionPin } from "../../../../components/map/UnifiedMap"
import { selectAllMissions } from "../../../../feature/missions/services/missions.selectors"
import { fetchMissions } from "../../../../feature/missions/services/missions.thunk"
import { useGetInterventionsQuery } from "../../../../feature/interventions/services/interventions.rtk"

const scope = getScopeForFolder("prefecture")

const SharedGisMapPage = ({ folder }: { folder: string }) => {
  const { reports, stats } = useTerritorialReports()
  const dispatch = useAppDispatch()
  
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const { locations } = useTeamLocations(currentUserId);

  // Charger les missions depuis le store Redux
  const missions = useAppSelector(selectAllMissions)
  const missionsLoading = useAppSelector((state) => state.missions.loading)
  
  const { data: interventions = [] } = useGetInterventionsQuery()

  useEffect(() => {
    if (!missionsLoading && missions.length === 0) {
      dispatch(fetchMissions())
    }
  }, [dispatch, missionsLoading, missions.length])

  // Convertir les positions GPS des équipes
  const teamLocations: TeamLocation[] = locations.map((loc) => ({
    team_id: loc.team_id,
    team_name: loc.team_name,
    latitude: loc.latitude,
    longitude: loc.longitude,
    check_in_time: loc.check_in_time,
  }))

  // Convertir les signalements en IncidentPin pour la carte
  const incidentsData: IncidentPin[] = useMemo(() => {
    return reports
      .filter((r) => r.latitude != null && r.longitude != null)
      .map((r) => ({
        id: r.id,
        title: r.title || 'Signalement',
        category: r.issueCategory,
        priority: r.riskLevel || r.priority || 'medium',
        lat: r.latitude!,
        lng: r.longitude!,
        district: (r as any).territory?.districtName || (r as any).territory?.municipalityName || 'Non spécifié',
        reporter: r.creator ? `${r.creator.firstName} ${r.creator.lastName}` : (r.createdBy || 'Agent'),
        details: r.description || 'Aucune description',
      }))
  }, [reports])

  // Convertir les missions en MissionPin pour la carte
  const missionsData: MissionPin[] = useMemo(() => {
    return missions
      .filter((m) => m.latitude != null && m.longitude != null)
      .map((m) => ({
        id: m.id,
        title: m.title,
        missionType: m.missionType,
        status: m.status,
        priority: m.priorityLevel,
        lat: m.latitude!,
        lng: m.longitude!,
        assignedTeamName: m.assignedTeamName,
        scheduledAt: m.scheduledAt,
        description: m.description,
      }))
  }, [missions])

  const interventionsData: InterventionPin[] = useMemo(() => {
    return interventions
      .filter((i) => i.latitude != null && i.longitude != null)
      .map((i) => ({
        id: i.id,
        title: i.title || `Intervention ${i.type}`,
        interventionType: i.type,
        status: i.status,
        missionId: i.missionId,
        lat: i.latitude!,
        lng: i.longitude!,
        userName: i.teamName || i.technicianName,
        startedAt: i.startedAt,
      }))
  }, [interventions])

  return (
    <RoleTerritorialPageShell folder={folder} pageId="gisMap">
      <div className="space-y-5">
        <TerritorialOverview scopeLabel={scope.scopeLabel} perimeterTag={scope.perimeterTag} />
        <TerritorialGisMapSection 
          folder={folder} 
          teamsData={teamLocations} 
          incidentsData={incidentsData}
          missionsData={missionsData}
          interventionsData={interventionsData}
        />
      </div>
    </RoleTerritorialPageShell>
  )
}

export default SharedGisMapPage
