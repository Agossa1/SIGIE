import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../stores/hooks'
import { fetchReports } from '../../feature/reports/services/reports.thunk'
import { selectAllReports, selectReportsLoading } from '../../feature/reports/services/reports.selectors'
import { FieldReportStatus, type TechnicianReport } from '../../feature/reports/services/reports.types'
import { StatusBadge } from '../../feature/reports/components/StatusBadge'
import { CategoryBadge } from '../../feature/reports/components/CategoryBadge'
import { ReportDetailsModal } from '../../feature/reports/components/ReportDetailsModal'
import { AlertTriangle, Loader2, Flag } from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function SgdsReportsPage() {
    const dispatch = useAppDispatch()
    const allReports = useAppSelector(selectAllReports)
    const loading = useAppSelector(selectReportsLoading)
    const [selectedReport, setSelectedReport] = useState<TechnicianReport | null>(null)

    useEffect(() => {
        if (allReports.length === 0) {
            dispatch(fetchReports())
        }
    }, [dispatch, allReports.length])

    const pendingReports = useMemo(
        () => allReports.filter(r => r.status === FieldReportStatus.PENDING_SGDS),
        [allReports]
    )

    const sortedPending = useMemo(
        () => [...pendingReports].sort((a, b) => {
            const priorityOrder = { emergency: 0, critical: 1, high: 2, medium: 3, low: 4 }
            const aP = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4
            const bP = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4
            return aP - bP || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }),
        [pendingReports]
    )

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Signalements en attente — SGDS</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Catégories : déchets, salubrité — En attente de votre décision
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">{sortedPending.length}</span>
                        <span className="text-sm text-gray-500">en attente</span>
                    </div>
                </div>
            </div>

            {/* Liste des signalements */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <LoadingSpinner size="lg" label="Chargement des signalements..." />
                </div>
            ) : sortedPending.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Flag className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Aucun signalement en attente</h3>
                    <p className="text-sm text-gray-500">Tous les signalements de salubrité ont été traités.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Priorité</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Titre</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Catégorie</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Localisation</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Statut</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {sortedPending.map((report) => (
                                    <tr
                                        key={report.id}
                                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedReport(report)}
                                    >
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                                report.priority === 'emergency' || report.priority === 'critical'
                                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                                    : report.priority === 'high'
                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                                            }`}>
                                                {report.priority === 'emergency' ? 'URGENT' :
                                                 report.priority === 'critical' ? 'Critique' :
                                                 report.priority === 'high' ? 'Prioritaire' :
                                                 report.priority || 'Normale'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <p className="text-sm font-semibold text-gray-900 truncate max-w-[250px]">{report.title}</p>
                                            {report.description && (
                                                <p className="text-xs text-gray-400 truncate max-w-[250px] mt-0.5">{report.description}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <CategoryBadge category={report.issueCategory} />
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <p className="text-sm text-gray-600 truncate max-w-[150px]">
                                                {report.neighborhoodName || report.municipalityName || report.neighborhoodId || '-'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <p className="text-sm text-gray-500">
                                                {new Date(report.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <StatusBadge status={report.status} />
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedReport(report)
                                                }}
                                                className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                                            >
                                                Traiter
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal détail */}
            {selectedReport && (
                <ReportDetailsModal
                    isOpen={!!selectedReport}
                    onClose={() => setSelectedReport(null)}
                    report={selectedReport}
                />
            )}
        </div>
    )
}