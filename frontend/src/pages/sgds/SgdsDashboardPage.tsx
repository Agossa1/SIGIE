import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart2,
  Building2,
  ChevronRight,
  Clock,
  FileText,
  Map,
  MapPin,
  Trash2,
  Wrench,
  Users,
  CheckCircle2,
} from 'lucide-react'
import { useAppSelector } from '../../stores/hooks'
import { StatusBadge } from '../../feature/reports/components/StatusBadge'
import { CategoryBadge } from '../../feature/reports/components/CategoryBadge'
import { useAuthRoles } from '../../feature/auth/hooks/useAuthRoles'
import { selectCurrentUser } from '../../feature/auth/services/auth.selectors'
import { FieldReportStatus } from '../../feature/reports/services/reports.types'
import { useGetAnalyticsSummaryQuery } from '../../feature/analytics/services/analytics.rtk'
import { selectAllReports } from '../../feature/reports/services/reports.selectors'
import { selectAllMissions } from '../../feature/missions/services/missions.selectors'
import { useFilteredMissions } from '../../feature/missions/hooks/useFilteredMissions'
import { buildRolePath } from '../shared/rolePages.config'
import TerritorialEmptyState from '../shared/territorial/TerritorialEmptyState'
import { KpiCard } from '../../components/ui/KpiCard' // Ensure KpiCard is imported

export default function SgdsDashboardPage() {
  const { roles } = useAuthRoles()
  const currentUser = useAppSelector(selectCurrentUser)
  const allReports = useAppSelector(selectAllReports)
  const rawMissions = useAppSelector(selectAllMissions)
  const allMissions = useFilteredMissions(rawMissions)
  const { data: analytics } = useGetAnalyticsSummaryQuery()

  const userName =
      [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(' ') || 'Directeur SGDS'

  // Signalements filtrés
  const pendingReports = useMemo(
      () => allReports.filter(r => r.status === FieldReportStatus.PENDING_SGDS),
      [allReports]
  )
  const resolvedReports = useMemo(
      () => allReports.filter(r => r.status === FieldReportStatus.RESOLVED || r.status === FieldReportStatus.VALIDATED),
      [allReports]
  )
  const recentPending = useMemo(() => [...pendingReports].slice(0, 5), [pendingReports])
  const hasReports = allReports.length > 0

  // Stats
  const stats = useMemo(() => ({
    total: allReports.length,
    pending: pendingReports.length,
    resolved: resolvedReports.length,
    missions: allMissions.length,
  }), [allReports, allMissions, pendingReports, resolvedReports])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const todayFormatted = new Date().toLocaleDateString('fr-BJ', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })

  return (
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* ── Bannière Hero ── */}
        <div className="bg-white border border-gray-200 rounded  p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <p className="text-gray-500 text-sm mb-2">{todayFormatted}</p>
            <h1 className="text-2xl font-semibold text-gray-900">
              {greeting}, {userName}
            </h1>
            <p className="text-gray-600 mt-2">
              {stats.pending > 0
                  ? `${stats.pending} signalement${stats.pending > 1 ? 's' : ''} de salubrité en attente de traitement.`
                  : hasReports
                      ? 'Tous les signalements de salubrité sont pris en charge.'
                      : 'Aucun signalement de salubrité sur votre périmètre.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
                to={buildRolePath(roles, 'agentReports')}
                className="inline-flex items-center gap-2 bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-green-800 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Voir les signalements
            </Link>
            <Link
                to={buildRolePath(roles, 'gisMap')}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cartographie <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Vue d'ensemble</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Signalements', value: stats.total, icon: <BarChart2 className="w-4 h-4" />, color: 'blue' },
              { label: 'En attente SGDS', value: stats.pending, icon: <Clock className="w-4 h-4" />, color: 'amber' },
              { label: 'Résolus', value: stats.resolved, icon: <CheckCircle2 className="w-4 h-4" />, color: 'emerald' },
              { label: 'Missions Actives', value: stats.missions, icon: <Wrench className="w-4 h-4" />, color: 'purple' },
            ].map(({ label, value, icon, color }) => (
                <KpiCard
                    key={label}
                    title={label}
                    value={value}
                    icon={icon}
                    color={color as 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'gray'}
                />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Indicateurs de Performance</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Déchets signalés', value: analytics?.categories?.find(c => c.name === 'waste')?.count || 0, icon: <Trash2 className="w-4 h-4" />, color: 'red' },
              { label: 'Salubrité', value: analytics?.categories?.find(c => c.name === 'other')?.count || 0, icon: <Building2 className="w-4 h-4" />, color: 'gray' },
              { label: 'Résolution globale', value: `${analytics?.reports?.resolutionRate || 0}%`, icon: <AlertTriangle className="w-4 h-4" />, color: 'emerald' },
              { label: 'SLA respecté', value: `${analytics?.sla?.complianceRate || 100}%`, icon: <Clock className="w-4 h-4" />, color: analytics && analytics.sla.complianceRate < 80 ? 'amber' : 'emerald' },
            ].map(({ label, value, icon, color }) => (
                <KpiCard
                    key={label}
                    title={label}
                    value={value}
                    icon={icon}
                    color={color as 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'gray'}
                />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Récents signalements en attente</h2>
              <Link
                  to={buildRolePath(roles, 'agentReports')}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors"
              >
                Tout voir <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {!recentPending.length ? (
                  <div className="p-8">
                    <TerritorialEmptyState
                        title="Aucun signalement en attente"
                        description="Dès qu'un superviseur aiguillera un signalement de salubrité vers le SGDS, il apparaîtra ici."
                        actionLabel="Consulter les opérations terrain"
                        actionPageId="fieldOps"
                    />
                  </div>
              ) : (
                  <ul className="divide-y divide-gray-100">
                    {recentPending.map((report) => (
                        <li
                            key={report.id}
                            className="p-5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{report.title}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(report.createdAt).toLocaleDateString('fr-BJ', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <CategoryBadge category={report.issueCategory} />
                            <StatusBadge status={report.status} />
                          </div>
                        </li>
                    ))}
                  </ul>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">Accès rapides</h2>
            <div className="bg-white border border-gray-200 rounded-xl p-3">
              <div className="space-y-1">
                {[
                  { pageId: 'agentReports' as const, icon: AlertTriangle, label: 'Signalements', sub: 'À traiter' },
                  { pageId: 'fieldOps' as const, icon: MapPin, label: 'Opérations', sub: 'Supervision terrain' },
                  { pageId: 'gisMap' as const, icon: Map, label: 'Cartographie', sub: 'Couches SIG' },
                  { pageId: 'sanitation' as const, icon: Building2, label: 'Salubrité', sub: 'Zones & collectes' },
                  { pageId: 'interventions' as const, icon: Wrench, label: 'Interventions', sub: 'Brigades' },
                  { pageId: 'teamsGps' as const, icon: Users, label: 'Équipes GPS', sub: 'Localisation temps réel' },
                ].map(({ pageId, icon: Icon, label, sub }) => (
                    <Link
                        key={pageId}
                        to={buildRolePath(roles, pageId)}
                        className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white group-hover:border-gray-300 transition-colors shrink-0">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{label}</p>
                        <p className="text-sm text-gray-500 truncate">{sub}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
  )
}