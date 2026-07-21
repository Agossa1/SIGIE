import { useGetTraceabilityQuery } from '../services/interventions.rtk';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { Flag, FlagTriangleRight, Wrench, CheckCircle } from 'lucide-react';

interface InterventionsTraceabilityProps {
    reportId: string;
}

/**
 * Timeline visuelle de la chaîne de traçabilité complète.
 * Signalement → Missions → Interventions → Résolution
 */
export function InterventionsTraceability({ reportId }: InterventionsTraceabilityProps) {
    const { data: chain, isLoading } = useGetTraceabilityQuery(reportId);

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <LoadingSpinner size="md" label="Chargement de la traçabilité..." />
            </div>
        );
    }

    if (!chain) return null;

    const hasContent = chain.report || chain.missions.length > 0 || chain.interventions.length > 0;

    if (!hasContent) {
        return (
            <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Aucune donnée de traçabilité disponible pour ce signalement.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
                <FlagTriangleRight className="w-4 h-4 text-emerald-600" />
                Traçabilité complète
            </h3>

            <div className="relative pl-8 space-y-0">
                {/* Ligne verticale */}
                <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-200" />

                {/* 1. Signalement */}
                {chain.report && (
                    <div className="relative pb-6">
                        <div className="absolute -left-[25px] top-1 w-5 h-5 rounded-full bg-red-100 border-2 border-red-400 flex items-center justify-center">
                            <Flag className="w-3 h-3 text-red-500" />
                        </div>
                        <div className="bg-red-50/50 rounded-xl p-4 border border-red-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Signalement</span>
                                <span className="text-xs text-gray-400">
                                    {new Date(chain.report.reportedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-800">{chain.report.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    chain.report.priority === 'critical' || chain.report.priority === 'emergency'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {chain.report.priority}
                                </span>
                                <span className="text-xs text-gray-400">{chain.report.municipalityName}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Missions */}
                {chain.missions.map((mission, index) => (
                    <div key={mission.id} className="relative pb-6">
                        <div className="absolute -left-[25px] top-1 w-5 h-5 rounded-full bg-blue-100 border-2 border-blue-400 flex items-center justify-center">
                            <FlagTriangleRight className="w-3 h-3 text-blue-500" />
                        </div>
                        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                                    Mission {chain.missions.length > 1 ? `#${index + 1}` : ''}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    mission.status === 'completed' || mission.status === 'validated'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : mission.status === 'in_progress'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {mission.status}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-800">{mission.title}</p>
                            {mission.teamName && (
                                <p className="text-xs text-gray-500 mt-1">Équipe : {mission.teamName}</p>
                            )}
                            {mission.scheduledAt && (
                                <p className="text-xs text-gray-400 mt-0.5">
                                    Planifiée : {new Date(mission.scheduledAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                </p>
                            )}
                        </div>
                    </div>
                ))}

                {/* 3. Interventions */}
                {chain.interventions.map((intervention, index) => (
                    <div key={intervention.id} className="relative pb-6">
                        <div className="absolute -left-[25px] top-1 w-5 h-5 rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center">
                            {intervention.status === 'completed' ? (
                                <CheckCircle className="w-3 h-3 text-emerald-500" />
                            ) : (
                                <Wrench className="w-3 h-3 text-emerald-500" />
                            )}
                        </div>
                        <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">
                                    Intervention {chain.interventions.length > 1 ? `#${index + 1}` : ''}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    intervention.status === 'completed'
                                        ? 'bg-emerald-200 text-emerald-800'
                                        : intervention.status === 'in_progress'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {intervention.status === 'in_progress' ? 'En cours' : intervention.status}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-800 capitalize">
                                {intervention.type?.replace(/_/g, ' ')}
                            </p>
                            {(intervention as any).completionPercentage != null && (
                                <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                                            style={{ width: `${(intervention as any).completionPercentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{(intervention as any).completionPercentage}% complété</p>
                                </div>
                            )}
                            {intervention.teamName && (
                                <p className="text-xs text-gray-500 mt-1">Équipe : {intervention.teamName}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}