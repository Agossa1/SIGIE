import { useGetTraceabilityQuery } from '../services/interventions.rtk';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { Flag, FlagTriangleRight, Wrench, CheckCircle, X, ArrowDown } from 'lucide-react';

interface InterventionsTraceabilityProps {
    reportId: string;
    onClose: () => void;
}

/**
 * Timeline visuelle de la chaîne de traçabilité complète (Modal).
 * Signalement → Missions → Interventions → Résolution
 */
export function InterventionsTraceability({ reportId, onClose }: InterventionsTraceabilityProps) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <FlagTriangleRight className="w-5 h-5 text-green-600" />
                            Traçabilité de l'intervention
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Historique complet depuis le signalement citoyen jusqu'à la résolution.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="relative pl-8 space-y-0 max-w-xl mx-auto">
                        {/* Ligne verticale */}
                        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-200" />

                        {/* 1. Signalement */}
                        {chain.report && (
                            <div className="relative pb-8">
                                <div className="absolute -left-[25px] top-2 w-6 h-6 rounded-full bg-red-100 border-4 border-white flex items-center justify-center">
                                    <Flag className="w-3 h-3 text-red-500" />
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-red-200 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-red-600">Étape 1 : Signalement Citoyen</span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(chain.report.reportedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800">{chain.report.title}</p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                                            chain.report.priority === 'critical' || chain.report.priority === 'emergency'
                                                ? 'bg-red-50 text-red-700 border border-red-100'
                                                : 'bg-gray-50 text-gray-600 border border-gray-200'
                                        }`}>
                                            {chain.report.priority}
                                        </span>
                                        {chain.report.regionName && (
                                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">{chain.report.regionName}</span>
                                        )}
                                        {chain.report.municipalityName && (
                                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">{chain.report.municipalityName}</span>
                                        )}
                                        {chain.report.districtName && (
                                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">{chain.report.districtName}</span>
                                        )}
                                        {chain.report.neighborhoodName && (
                                            <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">{chain.report.neighborhoodName}</span>
                                        )}
                                    </div>
                                    {chain.report.creatorName && (
                                        <p className="text-xs text-gray-600 mt-2 bg-red-50/50 p-2 rounded-lg border border-red-100/50">
                                            <span className="font-medium">Signalé par :</span> {chain.report.creatorName}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 2. Missions */}
                        {chain.missions.map((mission, index) => (
                            <div key={mission.id} className="relative pb-8">
                                <div className="absolute -left-[25px] top-2 w-6 h-6 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center">
                                    <FlagTriangleRight className="w-3 h-3 text-blue-500" />
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-200 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-blue-600">
                                            Étape 2 : Mission Planifiée {chain.missions.length > 1 ? `#${index + 1}` : ''}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                                            mission.status === 'Completed' || mission.status === 'Validated'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : mission.status === 'In Progress'
                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                : 'bg-gray-50 text-gray-600 border-gray-200'
                                        }`}>
                                            {mission.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800">{mission.title}</p>
                                    {mission.creatorName && (
                                        <p className="text-xs text-gray-600 mt-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                                            <span className="font-medium">Créée par :</span> {mission.creatorName}
                                        </p>
                                    )}
                                    {mission.teamName && (
                                        <p className="text-xs text-gray-600 mt-2 bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                                            <span className="font-medium">Équipe assignée :</span> {mission.teamName}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* 3. Interventions */}
                        {chain.interventions.map((intervention, index) => (
                            <div key={intervention.id} className="relative pb-2">
                                <div className="absolute -left-[25px] top-2 w-6 h-6 rounded-full bg-green-100 border-4 border-white flex items-center justify-center">
                                    {intervention.status === 'Terminée' ? (
                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                    ) : (
                                        <Wrench className="w-3 h-3 text-green-600" />
                                    )}
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-green-200 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-green-800">
                                            Étape 3 : Intervention Terrain {chain.interventions.length > 1 ? `#${index + 1}` : ''}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                                            intervention.status === 'Terminée'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : intervention.status === 'En cours'
                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                : 'bg-gray-50 text-gray-600 border-gray-200'
                                        }`}>
                                            {intervention.status === 'En cours' ? 'En cours' : intervention.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 capitalize">
                                        {intervention.type?.replace(/_/g, ' ')}
                                    </p>
                                    {(intervention as any).completionPercentage != null && (
                                        <div className="mt-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-gray-500 font-medium">Progression</span>
                                                <span className="text-xs text-green-700 font-bold">{(intervention as any).completionPercentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                <div
                                                    className="h-1.5 rounded-full bg-green-500 transition-all duration-500"
                                                    style={{ width: `${(intervention as any).completionPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {intervention.agentName ? (
                                        <p className="text-xs text-gray-600 mt-3 bg-green-50/50 p-2 rounded-lg border border-green-100/50">
                                            <span className="font-medium">Assignée à :</span> {intervention.agentName}
                                        </p>
                                    ) : intervention.teamName ? (
                                        <p className="text-xs text-gray-600 mt-3 bg-green-50/50 p-2 rounded-lg border border-green-100/50">
                                            <span className="font-medium">Équipe :</span> {intervention.teamName}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}