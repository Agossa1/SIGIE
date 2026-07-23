import type { TerritoryLayerKey } from '../../feature/territory/components/territorialMapShared'
import { TERRITORY_LAYER_CONFIG } from '../../feature/territory/components/territorialMapShared'
import type { GeoJsonFeatureCollection } from '../../feature/territory/services/territory.types'
import { INFRA_LAYER_CONFIG, type InfraLayerKey } from '../../feature/territory/hooks/useInfrastructureLayers'
import { Loader2 } from 'lucide-react'

interface UnifiedMapLegendProps {
  allowedLayers: TerritoryLayerKey[]
  activeLayers: TerritoryLayerKey[]
  onToggle: (key: TerritoryLayerKey) => void
  territoryGeoJson: Partial<Record<TerritoryLayerKey, GeoJsonFeatureCollection>>
  mapZoom: number
  incidentCount?: number
  missionCount?: number
  teamCount?: number

  // Infrastructure layers
  showInfraLayers?: boolean
  activeInfraLayers?: InfraLayerKey[]
  onToggleInfra?: (key: InfraLayerKey) => void
  infraLoading?: boolean
  infraGeoJson?: Partial<Record<InfraLayerKey, GeoJSON.FeatureCollection>>
}

const UnifiedMapLegend = ({
  allowedLayers,
  activeLayers,
  onToggle,
  territoryGeoJson,
  incidentCount = 0,
  missionCount = 0,
  teamCount = 0,

  showInfraLayers = false,
  activeInfraLayers = [],
  onToggleInfra,
  infraLoading = false,
  infraGeoJson = {},
}: UnifiedMapLegendProps) => {
  const visibleConfigs = TERRITORY_LAYER_CONFIG.filter((cfg) => allowedLayers.includes(cfg.key))

  return (
    <div className="flex flex-col gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm mb-3">
      {/* ── Couches territoriales ── */}
      <div>
        <h4 className="text-sm font-bold text-gray-400 mb-2">Découpage Territorial</h4>
        <div className="flex flex-wrap gap-2">
          {visibleConfigs.map((cfg) => {
            const isActive = activeLayers.includes(cfg.key)
            const count = territoryGeoJson[cfg.key]?.features?.length ?? 0
            return (
              <button
                key={cfg.key}
                onClick={() => onToggle(cfg.key)}
                title={count === 0 ? 'Aucune géométrie disponible pour ce niveau' : undefined}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-sm font-semibold transition-all cursor-pointer ${
                  isActive ? 'bg-emerald-50/50 border-emerald-500 text-emerald-800' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300 hover:bg-gray-50'
                } ${count === 0 ? 'opacity-50' : ''}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                {cfg.label}
                {count > 0 && (
                  <span className="text-sm font-medium opacity-60">({count})</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Couches d'infrastructure OSM ── */}
      {showInfraLayers && (
        <div className="pt-3 border-t border-gray-100">
          <h4 className="text-sm font-bold text-gray-400 mb-2">Infrastructures & Base (OSM)</h4>
          <div className="flex flex-wrap gap-2 items-center">
            {INFRA_LAYER_CONFIG.map((cfg) => {
              const isActive = activeInfraLayers.includes(cfg.key)
              const count = infraGeoJson[cfg.key]?.features?.length ?? 0
              return (
                <button
                  key={cfg.key}
                  onClick={() => onToggleInfra?.(cfg.key)}
                  className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-sm font-semibold transition-all cursor-pointer ${
                    isActive ? 'bg-emerald-50/50 border-emerald-500 text-emerald-800' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                  {cfg.label}
                  {infraLoading && isActive ? (
                    <Loader2 className="w-3 h-3 animate-spin opacity-50" />
                  ) : count > 0 ? (
                    <span className="text-sm font-medium opacity-60">({count})</span>
                  ) : null}
                </button>
              )
            })}
            {!infraLoading && Object.values(infraGeoJson).every(f => !f?.features?.length) && activeInfraLayers.length > 0 && (
              <p className="text-sm text-amber-600 font-medium ml-2">
                Données OSM indisponibles ou en cours de chargement…
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Badges & Légende ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <div className="flex gap-2">
          {/* Badge incidents */}
          {incidentCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Incidents
              <span className="text-sm font-medium text-gray-400">({incidentCount})</span>
            </div>
          )}

          {/* Badge missions */}
          {missionCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Missions
              <span className="text-sm font-medium text-gray-400">({missionCount})</span>
            </div>
          )}

          {/* Badge équipes */}

          {teamCount > 0 && (
            <div className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Équipes GPS
              <span className="text-sm font-medium text-gray-400">({teamCount})</span>
            </div>
          )}
        </div>

        {/* Légende couleurs risque */}
        <div className="flex items-center gap-4 text-sm font-semibold text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />Critique</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" />Urgent</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" />Faible</span>
        </div>
      </div>
    </div>
  )
}

export default UnifiedMapLegend
