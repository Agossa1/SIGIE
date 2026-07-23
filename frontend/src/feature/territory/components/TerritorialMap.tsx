import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { api } from "../../../lib/apiClient"
import { layersForPreset, type TerritorialMapPreset } from "../services/mapLayerPresets"
import type { TerritoryScope } from "../services/territoryScope"
import type { TerritoryGeoJsonLevel } from "../services/territory.types"
import { EMPTY_GEOMETRY_NOTICE } from "./territorialMapShared"
import UnifiedMap, { type IncidentPin, type MissionPin, type TeamLocation } from "../../../components/map/UnifiedMap"
import type { TerritoryLayerKey } from "./territorialMapShared"
import { getTerritorySubtitle, type TerritoryInfo } from "../../../components/map/mapHelpers"

export interface TerritorialMapProps {
  /** Preset de couches par défaut selon le rôle / espace. */
  preset?: TerritorialMapPreset
  /** Surcharge explicite des niveaux à charger (filtres scope toujours appliqués). */
  layers?: TerritoryGeoJsonLevel[]
  /** Périmètre manuel (sinon dérivé du JWT / utilisateur connecté). */
  scope?: TerritoryScope
  height?: string
  title?: string
  subtitle?: string
  showExpand?: boolean
  showLayerToggles?: boolean
  showEmptyGeometryNotice?: boolean
  className?: string
  /** Données d'incidents à afficher sur la carte (optionnel). */
  incidentsData?: IncidentPin[]
  /** Données des missions à afficher sur la carte (optionnel). */
  missionsData?: MissionPin[]
  /** Données GPS des équipes terrain à afficher (optionnel). */
  teamsData?: TeamLocation[]
  /** Données des interventions (optionnel). */
  interventionsData?: any[]
  onIncidentClick?: (pin: IncidentPin) => void
  onMissionClick?: (pin: MissionPin) => void
  /** Activer les couches d'infrastructure OSM (routes, cours d'eau, zones inondables). */
  showInfraLayers?: boolean
}

const TerritorialMap = ({
  preset = "commune-field",
  layers: layersProp,
  height = "24rem",
  title = "Cartographie territoriale (SIG)",
  subtitle,
  showExpand = true,
  showLayerToggles = true,
  showEmptyGeometryNotice = true,
  className = "",
  incidentsData,
  missionsData,
  teamsData,
  interventionsData,
  onIncidentClick,
  onMissionClick,
  showInfraLayers = false,
}: TerritorialMapProps) => {
  const configuredLayers = layersProp ?? layersForPreset(preset)

  const [territoryInfo, setTerritoryInfo] = useState<TerritoryInfo | null>(null)

  useEffect(() => {
    api.get<{ data: TerritoryInfo }>("/territory/user-boundary")
      .then(res => { if (res?.data) setTerritoryInfo(res.data) })
      .catch(console.error)
  }, [])

  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (!isExpanded) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setIsExpanded(false) }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [isExpanded])

  const mapSubtitle = subtitle ?? getTerritorySubtitle(territoryInfo, "Périmètre territorial")

  return (
    <>
      <div className={`flex flex-col gap-4 ${className}`}>
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium text-black">{title}</h3>
            <p className="text-sm text-gray-400 font-medium mt-0.5">{mapSubtitle}</p>
          </div>
          {showExpand && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all shadow-sm"
            >
              Agrandir
            </button>
          )}
        </div>

        {/* Notice géométrie manquante */}
        {showEmptyGeometryNotice && (
          <p className="text-sm text-amber-700/90 bg-amber-50/80 border border-amber-100 rounded-lg px-3 py-2 font-medium hidden" aria-hidden>
            {EMPTY_GEOMETRY_NOTICE}
          </p>
        )}

        {/* Carte centralisée — garder montée (hidden au lieu de unmount) pour éviter removeChild */}
        <div className={isExpanded ? 'hidden' : ''}>
          <UnifiedMap
            height={height}
            defaultActiveLayers={configuredLayers as TerritoryLayerKey[]}
            hideLegend={!showLayerToggles}
            incidentsData={incidentsData}
            missionsData={missionsData}
            interventionsData={interventionsData}
            teamsData={teamsData}
            onIncidentClick={onIncidentClick}
            onMissionClick={onMissionClick}
            showInfraLayers={showInfraLayers}
          />
        </div>


        {/* Bouton agrandir mobile */}
        {showExpand && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="sm:hidden w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm"
          >
            Agrandir la carte
          </button>
        )}
      </div>

      {/* Modale plein écran */}
      {isExpanded && showExpand
        ? createPortal(
            <div className="fixed inset-0 z-[9999] flex flex-col bg-white" role="dialog" aria-modal>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                <div>
                  <h2 className="text-sm font-medium text-black">{title}</h2>
                  <p className="text-sm text-gray-400 font-medium">{mapSubtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-all"
                >
                  Fermer
                </button>
              </div>
              <div className="flex-1 min-h-0 p-4">
                <UnifiedMap
                  height="100%"
                  defaultActiveLayers={configuredLayers as TerritoryLayerKey[]}
                  hideLegend={!showLayerToggles}
                  incidentsData={incidentsData}
                  missionsData={missionsData}
                  interventionsData={interventionsData}
                  teamsData={teamsData}
                  onIncidentClick={onIncidentClick}
                  onMissionClick={onMissionClick}
                  showInfraLayers={showInfraLayers}
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}

export default TerritorialMap
