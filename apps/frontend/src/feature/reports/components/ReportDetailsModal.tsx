import { useState } from 'react'
import type { TechnicianReport, PriorityLevel } from '../services/reports.types'
import { StatusBadge } from './StatusBadge'
import { CategoryBadge } from './CategoryBadge'
import { X, MapPin, Calendar, User, AlignLeft, AlertTriangle, Flag } from 'lucide-react'
import { useAppDispatch } from '../../../stores/hooks'
import { createMission, fetchMissions } from '../../missions/services/missions.thunk'
import { addReportComment } from '../services/reports.thunk'
import { useEffect } from 'react'
import { MessageSquare } from 'lucide-react'
import type { CreateMissionDTO } from '../../missions/services/missions.types'
import { MissionType } from '../../missions/services/missions.types'
import { CreateMissionModal } from '../../missions/components/CreateMissionModal'
import { useAppSelector } from '../../../stores/hooks'
import { selectAllMissions } from '../../missions/services/missions.selectors'

/**
 * Mappe une catégorie de signalement (IssueCategory) vers un type de mission (MissionType).
 * Permet la création d'une mission cohérente à partir d'un signalement.
 */
const mapIssueCategoryToMissionType = (category: string): MissionType => {
  switch (category) {
    case 'drainage':       return MissionType.DRAIN_CLEANING
    case 'waste':          return MissionType.WASTE_COLLECTION
    case 'road':           return MissionType.ROAD_REPAIR
    case 'lighting':       return MissionType.MAINTENANCE
    case 'flooding':       return MissionType.FLOOD_RESPONSE
    case 'biodiversity':   return MissionType.BIODIVERSITY_SURVEY
    case 'air_quality':    return MissionType.INSPECTION
    case 'water_quality':  return MissionType.INSPECTION
    case 'other':          return MissionType.INSPECTION
    default:               return MissionType.INSPECTION
  }
}


interface ReportDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  report: TechnicianReport
}

export function ReportDetailsModal({ isOpen, onClose, report: initialReport }: ReportDetailsModalProps) {
  const dispatch = useAppDispatch()
  const allMissions = useAppSelector(selectAllMissions)
  const [showCreateMission, setShowCreateMission] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [report, setReport] = useState<TechnicianReport>(initialReport)

  // Comments are loaded via getReportById (backend includes them)
  useEffect(() => {
    setReport(initialReport)
  }, [initialReport])

  // Trouver la mission liée s'il y en a une
  const linkedMission = allMissions.find(m => m.reportId === report.id)

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      const added = await dispatch(addReportComment({ reportId: report.id, data: { body: newComment, isInternal: true } })).unwrap()
      setReport(prev => ({ ...prev, comments: [...(prev.comments || []), added] }))
      setNewComment('')
    } catch (e) {
      console.error(e)
    }
  }

  const formattedDate = new Date(report.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })


  const authorName = report.creator ? `${report.creator.firstName} ${report.creator.lastName}` : report.createdBy || "Agent"
  const location = report.neighborhoodId
    ? `Quartier ${report.neighborhoodId}`
    : "Localisation non spécifiée"

  const getPriorityStyle = (priority?: PriorityLevel) => {
    switch (priority) {
      case 'emergency': return "bg-red-50 text-red-700 border-red-200"
      case 'critical': return "bg-red-50 text-red-700 border-red-200"
      case 'high': return "bg-amber-50 text-amber-700 border-amber-200"
      case 'medium': return "bg-gray-50 text-gray-700 border-gray-200"
      default: return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const translatePriority = (priority?: PriorityLevel) => {
    switch (priority) {
      case 'emergency': return "Urgent absolu"
      case 'critical': return "Critique"
      case 'high': return "Prioritaire"
      case 'medium': return "Normale"
      case 'low': return "Faible"
      default: return "Normale"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl p-6 text-left shadow-xl transform transition-all overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          <h3 className="text-lg font-bold text-gray-900">
            Détails du Signalement
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {/* En-tête : Titre et Badges */}
          <div>
            <h4 className="text-xl font-bold text-gray-800 mb-3">{report.title}</h4>
            <div className="flex flex-wrap gap-2">
              <CategoryBadge category={report.issueCategory} />
              <StatusBadge status={report.status} />
              <span className={`px-2.5 py-1 rounded-full border text-sm font-semibold flex items-center gap-1.5 ${getPriorityStyle(report.priority)}`}>
                <AlertTriangle className="w-3.5 h-3.5" />
                {translatePriority(report.priority)}
              </span>
            </div>
          </div>

          {/* Grille d'informations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-400">Localisation</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-400">Date & Heure</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{formattedDate}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 h-full">
                <User className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-gray-400">Auteur</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{authorName}</p>
          {report.creator?.roleCode && (
            <p className="text-sm font-medium text-gray-500 mt-0.5">{report.creator.roleCode}</p>
          )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <AlignLeft className="w-4 h-4 text-gray-600" />
              <h4 className="text-sm font-bold text-gray-900">Description des faits</h4>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {report.description || "Aucune description fournie par l'agent sur le terrain."}
            </p>
          </div>

          {/* Photo */}
          <div>
            <h4 className="text-sm font-bold text-gray-400 mb-2">Preuve photographique</h4>
            {(report.photoUrl || report.photoBase64) ? (
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex justify-center">
                <img 
                  src={
                    report.photoUrl || 
                    (report.photoBase64?.startsWith('data:image') 
                      ? report.photoBase64 
                      : `data:image/jpeg;base64,${report.photoBase64}`)
                  } 
                  alt="Preuve du signalement" 
                  className="max-w-full max-h-[300px] object-contain rounded-lg shadow-sm"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center p-8 text-gray-400">
                <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium">Aucune photo fournie</p>
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-gray-600" />
              <h4 className="text-sm font-bold text-gray-800">Commentaires & Notes internes</h4>
            </div>
            
            <div className="space-y-3 mb-4 max-h-[250px] overflow-y-auto pr-2">
              {report.comments && report.comments.length > 0 ? (
                report.comments.map(comment => (
                  <div key={comment.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm relative group">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-xs font-bold text-gray-800">
                        {comment.authorFirstName} {comment.authorLastName}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleString('fr-FR', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-400 text-center py-4">Aucun commentaire pour le moment.</div>
              )}
            </div>

            <div className="flex gap-2">
              <textarea
                placeholder="Ajouter une note..."
                className="flex-1 text-sm rounded-lg border border-gray-200 p-2 outline-none focus:border-emerald-500 min-h-[40px] resize-y"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="self-end px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                Ajouter
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between shrink-0">
          <div>
            {linkedMission && (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                <Flag className="w-4 h-4" />
                <span>Mission liée : {linkedMission.title}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={onClose}
            >
              Fermer
            </button>
            {!linkedMission && (
              <button
                type="button"
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
                onClick={() => {
                  setShowCreateMission(true)
                }}
              >
                <Flag className="w-3.5 h-3.5" />
                Créer une mission
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de création de mission pré-rempli */}
      {showCreateMission && (
        <CreateMissionModal
          onClose={() => setShowCreateMission(false)}
          onSubmit={async (data: CreateMissionDTO) => {
            await dispatch(createMission(data)).unwrap()
            dispatch(fetchMissions())
            setShowCreateMission(false)
            onClose()
          }}
          initialData={{
            title: `Mission : ${report.title}`,
            description: `Signalement traité : ${report.title}\n${report.description || ''}\n\nLocalisation : ${location}`,
            reportId: report.id,
            latitude: report.latitude,
            longitude: report.longitude,
            municipalityId: report.municipalityId,
              priorityLevel: report.priority || 'medium',
            missionType: mapIssueCategoryToMissionType(report.issueCategory),
          } as Partial<CreateMissionDTO>}
        />
      )}
    </div>
  )
}

