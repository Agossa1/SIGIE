import { useState, useEffect } from "react"
import { MapPin, Loader2, Navigation } from "lucide-react"
import RoleTerritorialPageShell from "../RoleTerritorialPageShell"
import TerritorialPanel from "../TerritorialPanel"
import { teamsApi } from "../../../../feature/teams/services/teams.api"
import type { Team } from "../../../../feature/teams/services/teams.types"
import { useTeamLocations } from "../../../../feature/teams/hooks/useTeamLocations"
import UnifiedMap, { type TeamLocation } from '../../../../components/map/UnifiedMap'
import { useAppSelector } from "../../../../stores/hooks"

const STATUS_LABEL: Record<string, string> = {
  active: "Disponible",
  suspended: "Suspendue",
  disabled: "Inactive",
  pending: "En attente",
}

const STATUS_STYLE: Record<string, string> = {
  active: "text-emerald-700 bg-emerald-50",
  suspended: "text-amber-700 bg-amber-50",
  disabled: "text-gray-400 bg-gray-100",
  pending: "text-blue-700 bg-blue-50",
}


const SharedTeamsGpsPage = ({ folder }: { folder: string }) => {
  // Récupération du vrai ID utilisateur depuis le store Auth
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const { locations, loading: locLoading, error: locError } = useTeamLocations(currentUserId);

  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<{lat: number; lng: number; zoom?: number} | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await teamsApi.getAllTeams()
        setTeams(data)
      } catch (err) {
        console.error("Erreur de chargement des brigades:", err)
        setError("Impossible de charger les brigades")
      } finally {
        setLoading(false)
      }
    }
    fetchTeams()
  }, [])

  // Adapter les locations WebSocket au format TeamLocation de UnifiedMap
  const teamLocations: TeamLocation[] = locations.map((loc) => ({
    team_id: loc.team_id,
    team_name: loc.team_name,
    latitude: loc.latitude,
    longitude: loc.longitude,
    check_in_time: loc.check_in_time,
  }))

  return (
    <RoleTerritorialPageShell folder={folder} pageId="teamsGps">
      <TerritorialPanel
        folder={folder}
        intro="Localisation et coordination des brigades terrain sur votre périmètre. Suivi GPS en temps réel."
        relatedLinks={[{ pageId: "fieldOps", label: "Opérations terrain" }]}
      >
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Carte centralisée */}
          <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden lg:col-span-2 order-1 lg:order-2">
            {locError && (
              <div className="mx-4 mt-4 bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-medium">
                {locError}
              </div>
            )}
            <div className="p-4">
              <UnifiedMap
                teamsData={locLoading ? [] : teamLocations}
                height="500px"
                center={mapCenter}
              />
            </div>
          </section>


          {/* Liste des équipes */}
          <section className="bg-white border border-gray-100 rounded-2xl overflow-hidden lg:col-span-1 flex flex-col max-h-[50vh] sm:max-h-[60vh] lg:max-h-none lg:h-[600px] order-2 lg:order-1">
            <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center gap-2 flex-shrink-0">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm sm:text-sm font-medium text-gray-900">Équipes actives</h3>
              <span className="ml-auto text-sm font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                {teams.length}
              </span>
            </div>

            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-6 sm:p-8 flex items-center justify-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Chargement...</span>
                </div>
              ) : error ? (
                <p className="p-3 sm:p-4 text-sm text-red-500 font-medium">{error}</p>
              ) : teams.length === 0 ? (
                <p className="p-3 sm:p-4 text-sm text-gray-400 font-medium">Aucune brigade active.</p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {teams.map((t) => {
                    const loc = locations.find(l => l.team_id === t.id);
                    return (
                      <li 
                        key={t.id} 
                        className={`p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 transition-colors ${loc ? 'cursor-pointer hover:bg-emerald-50/50' : 'opacity-70'}`}
                        onClick={() => {
                          if (loc) {
                            setMapCenter({ lat: loc.latitude, lng: loc.longitude, zoom: 15 });
                          }
                        }}
                      >
                        <div className="flex items-center justify-between gap-2 sm:gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                            <p className="text-sm text-gray-400 mt-0.5">{t.teamType ?? "—"}</p>
                          </div>
                          <span className={`text-sm font-medium px-2 py-1 rounded-lg shrink-0 ${STATUS_STYLE[t.status] ?? "text-gray-500 bg-gray-50"}`}>
                            {STATUS_LABEL[t.status] ?? t.status}
                          </span>
                        </div>
                        {loc && (
                          <div className="text-sm text-emerald-600 flex items-center gap-1 font-medium">
                            <Navigation className="w-3 h-3 shrink-0" />
                            Dernier signal: {new Date(loc.check_in_time).toLocaleTimeString()}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </TerritorialPanel>
    </RoleTerritorialPageShell>
  )
}

export default SharedTeamsGpsPage
