import { useState, useEffect } from 'react'
import type { TechnicianReport, PriorityLevel } from '../services/reports.types'
import { FieldReportStatus } from '../services/reports.types'
import { StatusBadge } from './StatusBadge'
import { CategoryBadge } from './CategoryBadge'
import { MapPin, Calendar, User, AlignLeft, AlertTriangle, Flag, MessageSquare, X, Check, RefreshCw, Send } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../../stores/hooks'
import { createMission, fetchMissions } from '../../missions/services/missions.thunk'
import { addReportComment } from '../services/reports.thunk'
import type { CreateMissionDTO } from '../../missions/services/missions.types'
import { MissionType } from '../../missions/services/missions.types'
import { CreateMissionModal } from '../../missions/components/CreateMissionModal'
import { selectAllMissions } from '../../missions/services/missions.selectors'
import { useValidateByTeamMutation, useRecommendReportMutation } from '../services/reports.rtk'
import { selectCurrentUser } from '../../auth/services/auth.selectors'
import { User_Role } from '../../auth/services/auth.types'

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
  const currentUser = useAppSelector(selectCurrentUser)
  const [validateByTeam] = useValidateByTeamMutation()
  const [recommendReport] = useRecommendReportMutation()

  const [showCreateMission, setShowCreateMission] = useState(false)
  const [showRecommendForm, setShowRecommendForm] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [report, setReport] = useState<TechnicianReport>(initialReport)
  const [recommendText, setRecommendText] = useState('')
  const [suggestedMissionType, setSuggestedMissionType] = useState('')
  const [suggestedPriority, setSuggestedPriority] = useState('')
  const [estimatedBudget, setEstimatedBudget] = useState<number | undefined>()
  const [urgentFlag, setUrgentFlag] = useState(false)
  const [isTeamValidating, setIsTeamValidating] = useState(false)
  const [isRecommending, setIsRecommending] = useState(false)

  useEffect(() => {
    setReport(initialReport)
  }, [initialReport])

  const linkedMission = allMissions.find(m => m.reportId === report.id)
  const userRoles = currentUser?.roles || []

  const isTeamLeader = userRoles.includes(User_Role.TEAM_LEADER)
  const isSupervisor = userRoles.includes(User_Role.SUPERVISOR)
  const canCreateMission = userRoles.includes(User_Role.SUPER_ADMIN) || userRoles.includes(User_Role.PLATFORM_ADMIN) || userRoles.includes(User_Role.DST_MANAGER) || userRoles.includes(User_Role.SGDS_MANAGER) || isSupervisor

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

  // ── Chef Brigade : Valider / Rejeter / Demander correction ──
  const handleTeamAction = async (action: 'validate' | 'reject' | 'request_revision') => {
    setIsTeamValidating(true)
    try {
      await validateByTeam({ reportId: report.id, action }).unwrap()
      const newStatus = action === 'validate' ? FieldReportStatus.VALIDATED_BY_TEAM : action === 'reject' ? FieldReportStatus.REJECTED : FieldReportStatus.NEEDS_REVISION
      setReport(prev => ({ ...prev, status: newStatus }))
    } catch (e) {
      console.error(e)
    } finally {
      setIsTeamValidating(false)
    }
  }

  // ── Superviseur : Recommander et aiguiller ──
  const handleRecommend = async () => {
    if (!recommendText.trim()) return
    setIsRecommending(true)
    try {
      await recommendReport({
        reportId: report.id,
        recommendation: recommendText,
        suggestedMissionType: suggestedMissionType || undefined,
        suggestedPriority: suggestedPriority || undefined,
        estimatedBudget,
        urgentFlag,
      }).unwrap()
      setReport(prev => ({
        ...prev,
        status: ['drainage', 'road', 'lighting', 'flooding'].includes(report.issueCategory) ? FieldReportStatus.PENDING_DST : FieldReportStatus.PENDING_SGDS,
      }))
      setShowRecommendForm(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsRecommending(false)
    }
  }

  const formattedDate = new Date(report.createdAt).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const authorName = report.creator ? `${report.creator.firstName} ${report.creator.lastName}` : report.createdBy || "Agent"
  const location = report.neighborhoodName || report.neighborhoodId || "Localisation non spécifiée"

  const getPriorityStyle = (priority?: PriorityLevel) => {
    switch (priority) {
      case 'emergency': return "bg-red-50 text-red-700 border-red-200"
      case 'critical': return "bg-red-50 text-red-700 border-red-200"
      case 'high': return "bg-amber-50 text-amber-700 border-amber-200"
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
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl p-6 text-left shadow-xl transform transition-all overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Détails du Signalement</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
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

          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <AlignLeft className="w-4 h-4 text-gray-600" />
              <h4 className="text-sm font-bold text-gray-900">Description des faits</h4>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {report.description || "Aucune description fournie par l'agent sur le terrain."}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-400 mb-2">Preuve photographique</h4>
            {(report.photoUrl || report.photoBase64) ? (
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex justify-center">
                <img
                  src={report.photoUrl || (report.photoBase64?.startsWith('data:image') ? report.photoBase64 : `data:image/jpeg;base64,${report.photoBase64}`)}
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

          {/* Comments */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-gray-600" />
              <h4 className="text-sm font-bold text-gray-800">Commentaires & Notes internes</h4>
            </div>
            <div className="space-y-3 mb-4 max-h-[250px] overflow-y-auto pr-2">
              {report.comments && report.comments.length > 0 ? (
                report.comments.map(comment => (
                  <div key={comment.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-xs font-bold text-gray-800">{comment.authorFirstName} {comment.authorLastName}</div>
                      <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
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
              <button onClick={handleAddComment} disabled={!newComment.trim()} className="self-end px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                Ajouter
              </button>
            </div>
          </div>

          {/* Formulaire Superviseur — Recommandation */}
          {showRecommendForm && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-3">
              <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2">
                <Send className="w-4 h-4" /> Recommandation & Aiguillage
              </h4>
              <textarea
                placeholder="Votre recommandation (ex: Curage urgent + réparation structurelle)..."
                className="w-full text-sm rounded-lg border border-amber-200 p-2 outline-none focus:border-amber-500 min-h-[60px] resize-y"
                value={recommendText}
                onChange={(e) => setRecommendText(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Type de mission suggéré"
                  className="text-sm rounded-lg border border-amber-200 p-2 outline-none focus:border-amber-500"
                  value={suggestedMissionType}
                  onChange={(e) => setSuggestedMissionType(e.target.value)}
                />
                <input
                  placeholder="Priorité suggérée"
                  className="text-sm rounded-lg border border-amber-200 p-2 outline-none focus:border-amber-500"
                  value={suggestedPriority}
                  onChange={(e) => setSuggestedPriority(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  placeholder="Budget estimé (FCFA)"
                  className="flex-1 text-sm rounded-lg border border-amber-200 p-2 outline-none focus:border-amber-500"
                  value={estimatedBudget ?? ''}
                  onChange={(e) => setEstimatedBudget(e.target.value ? Number(e.target.value) : undefined)}
                />
                <label className="flex items-center gap-1.5 text-sm text-amber-800">
                  <input type="checkbox" checked={urgentFlag} onChange={(e) => setUrgentFlag(e.target.checked)} className="rounded" />
                  Urgent
                </label>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowRecommendForm(false)} className="px-3 py-1.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  Annuler
                </button>
                <button onClick={handleRecommend} disabled={isRecommending || !recommendText.trim()} className="px-3 py-1.5 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center gap-1">
                  <Send className="w-3.5 h-3.5" />
                  {isRecommending ? 'Envoi...' : 'Recommander et aiguiller'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer avec actions selon le rôle */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between shrink-0 flex-wrap gap-3">
          {/* Actions Chef Brigade */}
          {isTeamLeader && report.status === FieldReportStatus.SUBMITTED && (
            <div className="flex gap-2">
              <button
                onClick={() => handleTeamAction('validate')}
                disabled={isTeamValidating}
                className="px-3 py-1.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Valider
              </button>
              <button
                onClick={() => handleTeamAction('request_revision')}
                disabled={isTeamValidating}
                className="px-3 py-1.5 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Correction
              </button>
              <button
                onClick={() => handleTeamAction('reject')}
                disabled={isTeamValidating}
                className="px-3 py-1.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Rejeter
              </button>
            </div>
          )}

          {/* Indicateur mission liée */}
          <div>
            {linkedMission && (
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                <Flag className="w-4 h-4" />
                <span>Mission liée : {linkedMission.title}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {isSupervisor && (report.status === FieldReportStatus.VALIDATED_BY_TEAM || report.status === FieldReportStatus.SUBMITTED) && !showRecommendForm && (
              <button
                onClick={() => setShowRecommendForm(true)}
                className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 border border-transparent rounded-lg hover:bg-amber-700 transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Recommander
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              Fermer
            </button>
            {!linkedMission && canCreateMission && (
              <button
                onClick={() => setShowCreateMission(true)}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                <Flag className="w-3.5 h-3.5" />
                Créer une mission
              </button>
            )}
          </div>
        </div>
      </div>

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