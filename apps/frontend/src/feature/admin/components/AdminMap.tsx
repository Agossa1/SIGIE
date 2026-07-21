import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { useAppDispatch, useAppSelector } from "../../../stores/hooks"
import { selectUserBoundary } from "../../territory/services/territory.selectors"
import { fetchUserBoundary } from "../../territory/services/territory.thunk"
import { reportsApi } from '../../reports/services/reports.api'
import UnifiedMap, { type IncidentPin } from '../../../components/map/UnifiedMap'
import { reportsToIncidentPins, getTerritorySubtitle, MAP_CATEGORY_FILTERS } from '../../../components/map/mapHelpers'
import { selectAllMissions } from '../../missions/services/missions.selectors'
import { createMission, fetchMissions } from '../../missions/services/missions.thunk'
import { CreateMissionModal } from '../../missions/components/CreateMissionModal'
import type { CreateMissionDTO } from '../../missions/services/missions.types'
import { MissionType } from '../../missions/services/missions.types'

interface AdminMapProps {
  /** Mode simplifié : carte propre avec dots teal, sans filtres ni panneau de détail */
  simpleMode?: boolean
}

const mapIssueCategoryToMissionType = (category: string): MissionType => {
  switch (category) {
    case 'drainage':      return MissionType.DRAIN_CLEANING
    case 'waste':         return MissionType.WASTE_COLLECTION
    case 'road':          return MissionType.ROAD_REPAIR
    case 'lighting':      return MissionType.MAINTENANCE
    case 'flooding':      return MissionType.FLOOD_RESPONSE
    case 'biodiversity':  return MissionType.BIODIVERSITY_SURVEY
    default:              return MissionType.INSPECTION
  }
}

const CATEGORY_LABELS: Record<string, string> = {
  flooding: 'Inondation', drainage: 'Obstruction canal', road: 'Dégradation voirie',
  waste: 'Insalubrité publique', biodiversity: 'Biodiversité', lighting: 'Éclairage', other: 'Autre',
}

const PRIORITY_STYLE: Record<string, string> = {
  critical:  'bg-rose-50 border-rose-100 text-rose-600',
  emergency: 'bg-rose-50 border-rose-100 text-rose-600',
  high:      'bg-amber-50 border-amber-100 text-amber-600',
  low:       'bg-green-50 border-green-100 text-green-600',
}
const PRIORITY_LABEL: Record<string, string> = {
  critical: 'Critique', emergency: 'Urgence absolue', high: 'Prioritaire', medium: 'Moyen', low: 'Faible',
}

const AdminMap = ({ simpleMode = false }: AdminMapProps) => {
  const [incidentPins, setIncidentPins] = useState<IncidentPin[]>([])
  const [selectedPin, setSelectedPin] = useState<IncidentPin | null>(null)
  const [showCreateMission, setShowCreateMission] = useState(false)

  useEffect(() => {
    reportsApi.getAllReports().then(reports => {
      setIncidentPins(reportsToIncidentPins(reports))
    }).catch(console.error)
  }, [])

  // ── Périmètre de l'utilisateur connecté ───────────────────────────────────
  const dispatch = useAppDispatch()
  const territoryInfo = useAppSelector(selectUserBoundary)
  const allMissions = useAppSelector(selectAllMissions)

  useEffect(() => {
    if (!territoryInfo) {
      dispatch(fetchUserBoundary())
    }
  }, [dispatch, territoryInfo])

  useEffect(() => {
    dispatch(fetchMissions())
  }, [dispatch])

  // ── Mode plein écran ───────────────────────────────────────────────────────
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (!isExpanded) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsExpanded(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isExpanded])

  // ── Filtre par catégorie ───────────────────────────────────────────────────
  const [activeFilters, setActiveFilters] = useState<string[]>([
    'flooding', 'drainage', 'road', 'waste', 'biodiversity', 'lighting', 'other'
  ])
  const toggleFilter = useCallback((key: string) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    )
  }, [])

  const filteredPins = incidentPins.filter((p) => activeFilters.includes(p.category))
  const mapSubtitle = getTerritorySubtitle(territoryInfo, 'Commune de Cotonou')

  // Mission liée au signalement sélectionné
  const linkedMission = selectedPin
    ? allMissions.find(m => m.reportId === selectedPin.id)
    : null

  const filterBar = (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 text-sm">
        <button
          onClick={() => setActiveFilters(activeFilters.length === 6 ? [] : ['flooding', 'drainage', 'road', 'waste', 'biodiversity', 'lighting', 'other'])}
          className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer font-medium ${
            activeFilters.length > 0 ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Tous
        </button>
        {MAP_CATEGORY_FILTERS.map((filter) => {
          const isActive = activeFilters.includes(filter.key)
          return (
            <button
              key={filter.key}
              onClick={() => toggleFilter(filter.key)}
              className={`px-3 py-1.5 rounded-full border flex items-center gap-2 transition-all cursor-pointer font-medium ${
                isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          )
        })}
      </div>
    </div>
  )

  // ── Mode simple : carte propre avec dots teal, sans filtres ──────────────
  if (simpleMode) {
    return (
      <UnifiedMap
        incidentsData={incidentPins}
        height="100%"
        hideLegend
        onIncidentClick={setSelectedPin}
      />
    )
  }

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col xl:flex-row gap-6">

        {/* ── Partie gauche : carte + filtres ─────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Titre + bouton agrandir */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium text-black">
                Supervision cartographique (SIG)
              </h3>
              <p className="text-sm text-gray-400 font-medium mt-0.5">{mapSubtitle}</p>
            </div>
            <button
              onClick={() => setIsExpanded(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Agrandir
            </button>
          </div>

          {/* Filtres catégorie */}
          {filterBar}

          {/* Carte centralisée */}
          {!isExpanded && (
            <UnifiedMap
              incidentsData={filteredPins}
              height="24rem"
              onIncidentClick={setSelectedPin}
            />
          )}

          {/* Bouton agrandir mobile */}
          <button
            onClick={() => setIsExpanded(true)}
            className="sm:hidden w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            Agrandir la carte
          </button>
        </div>

        {/* ── Panneau de dispatch ───────────────────────────────────────────── */}
        <div className="w-full xl:w-80 bg-gray-50/30 border border-gray-100 rounded-2xl p-5 flex flex-col gap-4">
          
          {/* En-tête panneau */}
          <div className="border-b border-gray-100 pb-3">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
              Panneau de dispatch
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              {selectedPin ? 'Signalement sélectionné' : 'Cliquez sur un point de la carte'}
            </p>
          </div>

          {selectedPin ? (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">

              {/* Nature + Priorité */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                  {CATEGORY_LABELS[selectedPin.category] || selectedPin.category}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${PRIORITY_STYLE[selectedPin.priority] || 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                  {PRIORITY_LABEL[selectedPin.priority] || selectedPin.priority}
                </span>
              </div>

              {/* Titre */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Objet</p>
                <p className="text-sm font-semibold text-gray-900 leading-tight">{selectedPin.title}</p>
              </div>

              {/* Localisation */}
              {(selectedPin.municipalityName || selectedPin.districtName || selectedPin.neighborhoodName) && (
                <div className="bg-white rounded-xl border border-gray-100 p-3 text-sm space-y-1.5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Localisation</p>
                  {selectedPin.municipalityName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Commune</span>
                      <span className="font-semibold text-gray-800">{selectedPin.municipalityName}</span>
                    </div>
                  )}
                  {selectedPin.districtName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Arrondissement</span>
                      <span className="font-semibold text-gray-800">{selectedPin.districtName}</span>
                    </div>
                  )}
                  {selectedPin.neighborhoodName && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quartier</span>
                      <span className="font-semibold text-gray-800">{selectedPin.neighborhoodName}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Signaleur */}
              {selectedPin.reporter && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                    {selectedPin.reporter.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 leading-tight">{selectedPin.reporter}</p>
                    {selectedPin.reporterRole && (
                      <p className="text-xs text-gray-400">{selectedPin.reporterRole}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Date */}
              {selectedPin.date && (
                <p className="text-xs text-gray-400">
                  📅 {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(selectedPin.date))}
                </p>
              )}

              {/* Mission liée */}
              {linkedMission ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Mission assignée</p>
                  <p className="text-sm font-semibold text-emerald-900">{linkedMission.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-medium">
                      {linkedMission.status.replace(/_/g, ' ')}
                    </span>
                    {linkedMission.isOverdue && (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-medium border border-red-100">
                        ⚠ En retard
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs font-medium text-amber-700">
                  ⚡ Aucune mission assignée à ce signalement
                </div>
              )}

              {/* Bouton dispatch */}
              <div className="mt-auto pt-2">
                {!linkedMission ? (
                  <button
                    onClick={() => setShowCreateMission(true)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer shadow-sm hover:shadow flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Créer une mission
                  </button>
                ) : (
                  <button
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer shadow-sm hover:shadow"
                    onClick={() => {/* Ouvrir MissionDetailsModal si besoin */}}
                  >
                    Consulter la mission
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 gap-3 py-8">
              <svg className="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-medium">Sélectionnez un point d'incident sur la carte pour dispatcher une mission</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modale plein écran ─────────────────────────────────────────────── */}
      {isExpanded && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex flex-col bg-white"
          role="dialog"
          aria-modal="true"
          aria-label="Carte SIG plein écran"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div>
                <h2 className="text-sm font-medium text-black">
                  Supervision cartographique (SIG)
                </h2>
                  <p className="text-sm text-gray-400 font-medium">{mapSubtitle}</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Fermer
            </button>
          </div>

          <div className="p-4 shrink-0">{filterBar}</div>

          <div className="flex-1 min-h-0 px-4 pb-4 flex flex-col">
            <UnifiedMap
              incidentsData={filteredPins}
              height="100%"
              onIncidentClick={setSelectedPin}
            />
          </div>
        </div>,
        document.body
      )}

      {/* ── Modal création de mission depuis la carte ──────────────────────── */}
      {showCreateMission && selectedPin && (
        <CreateMissionModal
          onClose={() => setShowCreateMission(false)}
          onSubmit={async (data: CreateMissionDTO) => {
            await dispatch(createMission(data)).unwrap()
            dispatch(fetchMissions())
            setShowCreateMission(false)
          }}
          initialData={{
            title: `Mission : ${selectedPin.title}`,
            description: `Signalement issu de la carte SIG.\nCatégorie : ${CATEGORY_LABELS[selectedPin.category] || selectedPin.category}\nLocalisation : ${selectedPin.district || 'Non spécifiée'}`,
            reportId: selectedPin.id,
            latitude: selectedPin.lat,
            longitude: selectedPin.lng,
            municipalityId: selectedPin.municipalityId,
            missionType: mapIssueCategoryToMissionType(selectedPin.category),
          } as Partial<CreateMissionDTO>}
        />
      )}
    </>
  )
}

export default AdminMap
