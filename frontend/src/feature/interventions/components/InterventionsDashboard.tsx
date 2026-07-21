import { useState } from "react";
import { Calendar, MapPin, Flag } from "lucide-react";
import { useAuthRoles } from "../../auth/hooks/useAuthRoles";
import { User_Role } from "../../auth/services/auth.types";
import {

    useGetInterventionsByMissionQuery,
    useCreateInterventionMutation,
    useUpdateInterventionStatusMutation,
} from "../services/interventions.rtk";
import { useGetMissionsQuery } from "../../missions/services/missions.rtk";
import { /* useGetReportByIdQuery */ } from "../../reports/services/reports.rtk";

import type { CreateInterventionDTO  } from "../services/interventions.types";
import { CreateInterventionModal } from "./CreateInterventionModal";

import { InterventionsKPIs } from "./InterventionsKPIs";
import { InterventionsByType } from "./InterventionsByType";
import { InterventionsByZone } from "./InterventionsByZone";
import { InterventionsTraceability } from "./InterventionsTraceability";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    pending: { label: "En attente", className: "bg-gray-100 text-gray-700" },
    accepted: { label: "Acceptée", className: "bg-blue-100 text-blue-700" },
    rejected: { label: "Refusée", className: "bg-red-100 text-red-700" },
    in_progress: { label: "En cours", className: "bg-amber-100 text-amber-700" },
    completed: { label: "Terminée", className: "bg-emerald-100 text-emerald-700" },
    cancelled: { label: "Annulée", className: "bg-rose-100 text-rose-700" },
};

const INTERVENTION_TYPE_LABELS: Record<string, string> = {
    drain_cleaning: "Curage drains",
    waste_collection: "Collecte déchets",
    road_repair: "Réfection voirie",
    flood_response: "Inondation",
    inspection: "Inspection",
    emergency_response: "Urgence",
    sanitation: "Assainissement",
    maintenance: "Maintenance",
};

interface InterventionsDashboardProps {
    missionId?: string;
}

export const InterventionsDashboard = ({ missionId: initialMissionId }: InterventionsDashboardProps) => {
    const { roles, hasAdminAccess } = useAuthRoles();
    const isFieldAgent = roles.includes('field_agent' as any) || roles.includes(User_Role.TECHNICIAN)
        || (!hasAdminAccess && !roles.includes(User_Role.SUPERVISOR as any));

    const [selectedMissionId, setSelectedMissionId] = useState<string>(initialMissionId ?? "");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [showTraceability, setShowTraceability] = useState(false);

    // RTK Query — remplace dispatch(fetchMissions) + useAppSelector(selectAllMissions)
    const { data: missions = [] } = useGetMissionsQuery();

    // RTK Query — remplace dispatch(fetchInterventions*) + useAppSelector(selectAllInterventions)
    const { data: interventions = [], isLoading } = useGetInterventionsByMissionQuery(
        selectedMissionId,
        { skip: !selectedMissionId || isFieldAgent }
    );

    // Mutations RTK Query
    const [createIntervention] = useCreateInterventionMutation();
    const [updateStatus] = useUpdateInterventionStatusMutation();

    const selectedMission = missions.find(m => m.id === selectedMissionId);
    // const linkedReportQuery = /* useGetReportByIdQuery */(
    //     selectedMission?.reportId ?? '',
    //     { skip: !selectedMission?.reportId }
    // );

    const handleCreate = async (data: CreateInterventionDTO) => {
        await createIntervention(data).unwrap();
        setIsCreateOpen(false);
    };

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await updateStatus({ id, status }).unwrap();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

    const formatDuration = (startedAt?: string, endedAt?: string) => {
        if (!startedAt) return "—";
        const diffMs = (endedAt ? new Date(endedAt) : new Date()).getTime() - new Date(startedAt).getTime();
        const hours = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        return endedAt ? `${hours}h ${mins}min` : `En cours (${hours}h ${mins}min)`;
    };

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="flex flex-col gap-2 bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Interventions & Déploiements</h1>
                <p className="text-sm text-gray-500">Supervisez l'affectation et l'avancement des équipes sur le terrain.</p>
            </div>

            {/* KPIs décisionnels (toutes interventions confondues) */}
            <InterventionsKPIs />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InterventionsByType />
                <InterventionsByZone />
            </div>

            {isFieldAgent ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-white">
                        <h3 className="text-base font-semibold text-gray-900">Mes Interventions Assignées</h3>
                    </div>
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Chargement...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left whitespace-nowrap">
                                <thead className="bg-gray-50/50 text-sm font-medium text-gray-800">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-4">Type</th>
                                        <th className="px-4 sm:px-6 py-4">Statut</th>
                                        <th className="px-4 sm:px-6 py-4 hidden md:table-cell">Progression</th>
                                        <th className="px-4 sm:px-6 py-4 hidden sm:table-cell">Début</th>
                                        <th className="px-4 sm:px-6 py-4 hidden lg:table-cell">Durée</th>
                                        <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {interventions.map((intervention) => (
                                        <tr key={intervention.id} className="hover:bg-gray-50/50">
                                            <td className="px-4 sm:px-6 py-4">
                                                <span className="text-sm font-bold text-gray-900">
                                                    {INTERVENTION_TYPE_LABELS[intervention.interventionType] ?? intervention.interventionType}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_CONFIG[intervention.status]?.className || 'bg-gray-100'}`}>
                                                    {STATUS_CONFIG[intervention.status]?.label || intervention.status}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                                                {intervention.completionPercentage != null ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                                            <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${intervention.completionPercentage}%` }} />
                                                        </div>
                                                        <span className="text-sm text-gray-500">{intervention.completionPercentage}%</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                                                {intervention.startedAt ? formatDate(intervention.startedAt) : "—"}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-700 hidden lg:table-cell">
                                                {formatDuration(intervention.startedAt, intervention.endedAt)}
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-right">
                                                <select
                                                    className="text-sm border border-gray-200 rounded-xl px-2 py-1.5 bg-white cursor-pointer outline-none focus:border-indigo-500"
                                                    value={intervention.status}
                                                    onChange={(e) => handleStatusChange(intervention.id, e.target.value)}
                                                >
                                                    {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                                                        <option key={key} value={key}>{label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6 items-start">
                    {/* Panneau gauche : Liste des missions */}
                    <div className="bg-white border border-gray-100 rounded-2xl flex flex-col h-[700px] overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-base font-semibold text-gray-900">Missions Actives</h2>
                            <p className="text-sm text-gray-500 mt-1">Sélectionnez une mission pour gérer ses interventions.</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {missions.map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => {
                                        setSelectedMissionId(m.id);
                                        setShowTraceability(false);
                                    }}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                                        m.id === selectedMissionId
                                            ? "border-indigo-500 bg-indigo-50/30 ring-1 ring-indigo-500 shadow-sm"
                                            : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-semibold text-sm line-clamp-2 text-gray-900">{m.title}</h3>
                                        {(m.priorityLevel === 'critical' || m.priorityLevel === 'emergency') && (
                                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5 animate-pulse" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-3">
                                        <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {formatDate(m.createdAt)}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                            m.status === 'completed' || m.status === 'validated'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {m.status}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Panneau droit : Détails + Interventions */}
                    <div className="flex flex-col gap-6">
                        {!selectedMissionId ? (
                            <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center p-16">
                                <div className="text-center max-w-sm">
                                    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                                        <Flag className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez une mission</h3>
                                    <p className="text-sm text-gray-500">Choisissez une mission à gauche pour voir ses détails et gérer les interventions.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Détails de la mission */}
                                {selectedMission && (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <h2 className="text-lg font-bold text-gray-900">{selectedMission.title}</h2>
                                            <button
                                                onClick={() => setIsCreateOpen(true)}
                                                className="shrink-0 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                                            >
                                                + Nouvelle Intervention
                                            </button>
                                        </div>
                                        {selectedMission.municipalityName && (
                                            <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4 text-emerald-600" />
                                                {selectedMission.municipalityName}
                                            </p>
                                        )}
                                        {selectedMission.reportId && (
                                            <button
                                                onClick={() => setShowTraceability(!showTraceability)}
                                                className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
                                            >
                                                {showTraceability ? 'Masquer' : 'Voir'} la traçabilité complète →
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Traçabilité */}
                                {showTraceability && selectedMission?.reportId && (
                                    <InterventionsTraceability reportId={selectedMission.reportId} />
                                )}

                                {/* Tableau des interventions */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="text-base font-semibold text-gray-900">Registre des Interventions</h3>
                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-full">
                                            {interventions.length} intervention{interventions.length !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    {isLoading ? (
                                        <div className="p-12 text-center">
                                            <div className="w-6 h-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-2" />
                                            <p className="text-sm text-gray-400">Chargement...</p>
                                        </div>
                                    ) : interventions.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <p className="text-sm text-gray-400">Aucune intervention pour cette mission.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-left whitespace-nowrap">
                                                <thead className="bg-gray-50/50 text-sm font-medium text-gray-800">
                                                    <tr>
                                                        <th className="px-6 py-4">Type</th>
                                                        <th className="px-6 py-4">Statut</th>
                                                        <th className="px-6 py-4">Progression</th>
                                                        <th className="px-6 py-4">Début</th>
                                                        <th className="px-6 py-4">Durée</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 bg-white">
                                                    {interventions.map((intervention) => (
                                                        <tr key={intervention.id} className="hover:bg-gray-50/50">
                                                            <td className="px-6 py-4">
                                                                <span className="text-sm font-bold text-gray-900">
                                                                    {INTERVENTION_TYPE_LABELS[intervention.interventionType] ?? intervention.interventionType}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2 py-1 rounded-full text-sm font-medium ${STATUS_CONFIG[intervention.status]?.className || 'bg-gray-100'}`}>
                                                                    {STATUS_CONFIG[intervention.status]?.label || intervention.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {intervention.completionPercentage != null ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                                                            <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${intervention.completionPercentage}%` }} />
                                                                        </div>
                                                                        <span className="text-sm text-gray-500">{intervention.completionPercentage}%</span>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm text-gray-400">—</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                                {intervention.startedAt ? formatDate(intervention.startedAt) : "—"}
                                                            </td>
                                                            <td className="px-6 py-4 text-sm font-medium text-gray-700">
                                                                {formatDuration(intervention.startedAt, intervention.endedAt)}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex gap-2 justify-end">
                                                                    <select
                                                                        className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white cursor-pointer outline-none focus:border-indigo-500"
                                                                        value={intervention.status}
                                                                        onChange={(e) => handleStatusChange(intervention.id, e.target.value)}
                                                                    >
                                                                        {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                                                                            <option key={key} value={key}>{label}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modales */}
            {isCreateOpen && selectedMissionId && (
                <CreateInterventionModal
                    missionId={selectedMissionId}
                    onClose={() => setIsCreateOpen(false)}
                    onSubmit={handleCreate}
                />
            )}
        </div>
    );
};