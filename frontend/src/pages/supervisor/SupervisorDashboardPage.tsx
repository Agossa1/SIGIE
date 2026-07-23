import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart2, Building2, ChevronRight,
  FileText, Map, MapPin, Wrench, Users, Send
} from 'lucide-react'
import { useAppSelector } from '../../stores/hooks'
import { StatusBadge } from '../../feature/reports/components/StatusBadge'
import { CategoryBadge } from '../../feature/reports/components/CategoryBadge'
import { useAuthRoles } from '../../feature/auth/hooks/useAuthRoles'
import { selectCurrentUser } from '../../feature/auth/services/auth.selectors'
import { FieldReportStatus } from '../../feature/reports/services/reports.types'
import { selectAllReports } from '../../feature/reports/services/reports.selectors'
import { selectAllMissions } from '../../feature/missions/services/missions.selectors'
import { buildRolePath } from '../shared/rolePages.config'
import TerritorialEmptyState from '../shared/territorial/TerritorialEmptyState'
import { CreateMissionModal } from '../../feature/missions/components/CreateMissionModal'
import { useCreateMissionMutation } from '../../feature/missions/services/missions.rtk'
import type { CreateMissionDTO } from '../../feature/missions/services/missions.types'

export default function SupervisorDashboardPage() {
  const { roles } = useAuthRoles()
  const currentUser = useAppSelector(selectCurrentUser)
  const allReports = useAppSelector(selectAllReports)
  const allMissions = useAppSelector(selectAllMissions)
  const [createMission] = useCreateMissionMutation()
  
  const [isCreateMissionOpen, setIsCreateMissionOpen] = useState(false)
  const [missionModalReportId, setMissionModalReportId] = useState<string | undefined>(undefined)

  const handleCreateMission = async (data: CreateMissionDTO) => {
    await createMission(data).unwrap()
    setIsCreateMissionOpen(false)
    setMissionModalReportId(undefined)
  }

  const userName =
    [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || 'Superviseur'

  // Signalements en attente de création de mission et d'assignation
  const readyToAssign = useMemo(
    () => allReports.filter(r => [
      FieldReportStatus.VALIDATED_BY_TEAM,
      FieldReportStatus.SUBMITTED,
      FieldReportStatus.PENDING_DST,
      FieldReportStatus.PENDING_SGDS
    ].includes(r.status)),
    [allReports]
  )
  const pendingDst = useMemo(() => allReports.filter(r => r.status === FieldReportStatus.PENDING_DST), [allReports])
  const pendingSgds = useMemo(() => allReports.filter(r => r.status === FieldReportStatus.PENDING_SGDS), [allReports])
  const recentToAssign = useMemo(() => [...readyToAssign].slice(0, 5), [readyToAssign])

  const stats = useMemo(() => ({
    total: allReports.length,
    toAssign: readyToAssign.length,
    routedDst: pendingDst.length,
    routedSgds: pendingSgds.length,
    missions: allMissions.length,
  }), [allReports, allMissions, readyToAssign, pendingDst, pendingSgds])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const todayFormatted = new Date().toLocaleDateString('fr-BJ', { weekday: 'long', day: '2-digit', month: 'long' })

  return (
    <div className="space-y-6">
      {/* Bannière Hero */}
      <div className="relative bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl p-5 sm:p-6 overflow-hidden text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/svg%3E\")", backgroundSize: '30px 30px' }} />
        <div className="relative">
          <p className="text-amber-200 text-sm font-medium capitalize">{todayFormatted}</p>
          <h3 className="text-lg sm:text-xl font-medium mt-0.5">{greeting}, {userName}</h3>
          <p className="text-amber-100 text-sm mt-1 font-medium">
            {stats.toAssign > 0
              ? `${stats.toAssign} signalement${stats.toAssign > 1 ? 's' : ''} reçu(s) en attente d'assignation.`
              : 'Aucun nouveau signalement dans votre zone.'}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link to={buildRolePath(roles, 'agentReports')} className="inline-flex items-center gap-1.5 bg-white text-amber-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-amber-50 transition-colors shadow-sm">
              <FileText className="w-3.5 h-3.5" />Voir les signalements
            </Link>
            <Link to={buildRolePath(roles, 'gisMap')} className="inline-flex items-center gap-1.5 bg-amber-700/50 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-amber-700/70 transition-colors">
              Cartographie <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mini-KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Signalements', value: stats.total, icon: BarChart2, color: 'bg-blue-50 text-blue-700 ring-blue-200' },
          { label: 'À assigner', value: stats.toAssign, icon: Send, color: 'bg-amber-50 text-amber-700 ring-amber-200' },
          { label: 'Assignés DST', value: stats.routedDst, icon: Building2, color: 'bg-purple-50 text-purple-700 ring-purple-200' },
          { label: 'Assignés SGDS', value: stats.routedSgds, icon: Users, color: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`rounded-xl p-4 ring-1 ring-inset ${color}`}>
            <div className="flex items-center justify-between mb-1"><p className="text-sm font-medium opacity-70">{label}</p><Icon className="w-4 h-4 opacity-50" /></div>
            <p className="text-2xl font-medium">{value}</p>
          </div>
        ))}
      </div>

      {/* Signalements à recommander + Accès rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
            <div><h3 className="text-sm font-medium text-gray-900">Signalements reçus</h3><p className="text-sm text-gray-400 mt-0.5">En attente de création de mission et d'assignation</p></div>
            <Link to={buildRolePath(roles, 'agentReports')} className="text-sm font-medium text-amber-700 hover:underline flex items-center gap-1">Tout voir <ChevronRight className="w-3.5 h-3.5" /></Link>
          </div>
          {!recentToAssign.length ? (
            <div className="p-6"><TerritorialEmptyState title="Aucun signalement à assigner" description="Les nouveaux signalements de votre zone apparaîtront ici." actionLabel="Consulter les opérations terrain" actionPageId="fieldOps" /></div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentToAssign.map((report) => (
                <li key={report.id} className="p-4 sm:px-5 sm:py-3.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{report.title}</p><p className="text-sm text-gray-400 mt-0.5">{new Date(report.createdAt).toLocaleDateString('fr-BJ', { day: '2-digit', month: 'short', year: 'numeric' })}</p></div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <CategoryBadge category={report.issueCategory} />
                    <StatusBadge status={report.status} />
                    <button
                      onClick={() => {
                        setMissionModalReportId(report.id)
                        setIsCreateMissionOpen(true)
                      }}
                      className="mt-1 flex items-center gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-indigo-100 shadow-sm"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Assigner (Créer Mission)
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-5">
          <section className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Actions rapides</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setMissionModalReportId(undefined)
                  setIsCreateMissionOpen(true)
                }}
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:opacity-90 transition-opacity bg-indigo-50 text-indigo-700 text-left"
              >
                <Wrench className="w-5 h-5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">Créer une mission</p>
                  <p className="text-sm font-medium opacity-70 truncate">Assigner à SGDS/DST</p>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto opacity-40 shrink-0" />
              </button>
              {[
                { pageId: 'agentReports' as const, icon: Send, label: 'Gérer les signalements', sub: 'Créer missions et assigner', color: 'bg-amber-50 text-amber-700' },
                { pageId: 'fieldOps' as const, icon: MapPin, label: 'Opérations terrain', sub: 'Supervision des missions', color: 'bg-emerald-50 text-emerald-700' },
                { pageId: 'gisMap' as const, icon: Map, label: 'Cartographie SIG', sub: 'Couches territoriales', color: 'bg-sky-50 text-sky-700' },
                { pageId: 'interventions' as const, icon: Wrench, label: 'Interventions', sub: 'Brigades et chantiers', color: 'bg-gray-50 text-gray-700' },
                { pageId: 'teamsGps' as const, icon: Users, label: 'Équipes GPS', sub: 'Localisation temps réel', color: 'bg-blue-50 text-blue-700' },
              ].map(({ pageId, icon: Icon, label, sub, color }) => (
                <Link key={pageId} to={buildRolePath(roles, pageId)} className={`flex items-center gap-3 w-full p-3 rounded-xl hover:opacity-90 transition-opacity ${color}`}>
                  <Icon className="w-5 h-5 shrink-0" /><div className="min-w-0"><p className="text-sm font-medium">{label}</p><p className="text-sm font-medium opacity-70 truncate">{sub}</p></div><ChevronRight className="w-4 h-4 ml-auto opacity-40 shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      {isCreateMissionOpen && (
        <CreateMissionModal
          initialData={missionModalReportId ? { reportId: missionModalReportId } : undefined}
          onClose={() => {
            setIsCreateMissionOpen(false)
            setMissionModalReportId(undefined)
          }}
          onSubmit={handleCreateMission}
        />
      )}
    </div>
  )
}