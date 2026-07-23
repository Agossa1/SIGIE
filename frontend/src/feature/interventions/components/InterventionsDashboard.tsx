import { useState } from "react";
import { Calendar, MapPin, Flag, Plus, FileText, ArrowRight } from "lucide-react";
import { useAuthRoles } from "../../auth/hooks/useAuthRoles";
import { User_Role } from "../../auth/services/auth.types";
import {
    useGetInterventionsQuery,
    useGetInterventionsByMissionQuery,
    useCreateInterventionMutation,
    useUpdateInterventionMutation,
    useCreateInterventionLogMutation,
} from "../services/interventions.rtk";
import { useGetMissionsQuery, useCreateMissionMutation } from "../../missions/services/missions.rtk";
import { /* useGetReportByIdQuery */ } from "../../reports/services/reports.rtk";


import type { CreateInterventionDTO, CreateInterventionReportDTO  } from "../services/interventions.types";
import type { CreateMissionDTO } from "../../missions/services/missions.types";
import { CreateInterventionModal } from "./CreateInterventionModal";
import { CreateMissionModal } from "../../missions/components/CreateMissionModal";
import { InterventionReportModal } from "./InterventionReportModal";

import { InterventionsKPIs } from "./InterventionsKPIs";
import { InterventionsByType } from "./InterventionsByType";
import { InterventionsByZone } from "./InterventionsByZone";
import { InterventionsTraceability } from "./InterventionsTraceability";
import { InterventionDetailsPanel } from "./InterventionDetailsPanel";
import type { Intervention } from "../services/interventions.types";

export const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    pending: { label: "En attente", className: "bg-gray-100 text-gray-700" },
    accepted: { label: "Acceptée", className: "bg-blue-100 text-blue-700" },
    rejected: { label: "Refusée", className: "bg-red-100 text-red-700" },
    in_progress: { label: "En cours", className: "bg-amber-100 text-amber-700" },
    completed: { label: "Terminée", className: "bg-emerald-100 text-emerald-700" },
    cancelled: { label: "Annulée", className: "bg-rose-100 text-rose-700" },
};

export const INTERVENTION_TYPE_LABELS: Record<string, string>  = {
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
    const { roles,  } = useAuthRoles();
    const isFieldAgent = roles.some(r => [User_Role.TECHNICIAN, User_Role.TEAM_LEADER].includes(r));
    const isInterveningOrg = roles.some(r => [
        User_Role.SGDS_MANAGER, 
        User_Role.DST_MANAGER, 
        User_Role.TECHNICIAN, 
        User_Role.TEAM_LEADER,
        User_Role.SUPER_ADMIN,
        User_Role.PLATFORM_ADMIN
    ].includes(r));

    const [selectedMissionId, setSelectedMissionId] = useState<string>(initialMissionId ?? "");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreateMissionOpen, setIsCreateMissionOpen] = useState(false);
    const [reportInterventionId, setReportInterventionId] = useState<string | null>(null);
    const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);

    const [showTraceability, setShowTraceability] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");

    // RTK Query — remplace dispatch(fetchMissions) + useAppSelector(selectAllMissions)
    const { data: missions = [] } = useGetMissionsQuery(undefined, { skip: isFieldAgent });

    // Pour les managers, on récupère les interventions de la mission sélectionnée
    const { data: interventionsByMission = [], isLoading: isMissionInterventionsLoading } = useGetInterventionsByMissionQuery(
        selectedMissionId,
        { skip: !selectedMissionId || isFieldAgent }
    );

    // Pour les agents terrain, on récupère toutes leurs interventions (filtrées par le backend selon leur teamId)
    const { data: allInterventions = [], isLoading: isAllInterventionsLoading } = useGetInterventionsQuery(
        undefined,
        { skip: !isFieldAgent }
    );

    const interventions = isFieldAgent ? allInterventions : interventionsByMission;
    const isLoading = isFieldAgent ? isAllInterventionsLoading : isMissionInterventionsLoading;

    // Computed filtered interventions
    const filteredInterventions = interventions.filter(int => {
        const matchesStatus = statusFilter === 'all' || int.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || int.priority === priorityFilter;
        const search = searchQuery.toLowerCase();
        const matchesSearch = search === '' || 
            (int.interventionType && INTERVENTION_TYPE_LABELS[int.interventionType]?.toLowerCase().includes(search)) ||
            (int.agentName && int.agentName.toLowerCase().includes(search)) ||
            (int.status && STATUS_CONFIG[int.status]?.label.toLowerCase().includes(search));
        
        return matchesStatus && matchesPriority && matchesSearch;
    });

    // Mutations RTK Query
    const [createIntervention] = useCreateInterventionMutation();
    const [updateIntervention] = useUpdateInterventionMutation();
    const [createMission] = useCreateMissionMutation();
    const [createLog] = useCreateInterventionLogMutation();

    const selectedMission = missions.find(m => m.id === selectedMissionId);
    // const linkedReportQuery = /* useGetReportByIdQuery */(
    //     selectedMission?.reportId ?? '',
    //     { skip: !selectedMission?.reportId }
    // );

    const handleCreate = async (data: CreateInterventionDTO) => {
        await createIntervention(data).unwrap();
        setIsCreateOpen(false);
    };

    const handleCreateMission = async (data: CreateMissionDTO) => {
        await createMission(data).unwrap();
        setIsCreateMissionOpen(false);
    };

    const handleStatusChange = async (id: string, status: string) => {
        try {
            await updateIntervention({ id, data: { status } }).unwrap();
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleReport = async (interventionId: string, data: CreateInterventionReportDTO) => {
        await createLog({
            interventionId,
            log: {
                logType: 'note',
                comment: `**Rapport d'intervention**\n\n**Travaux effectués :** ${data.workDone}${data.blockageRemovedPct != null ? `\n**Déblocage :** ${data.blockageRemovedPct}%` : ''}${data.finalConditionScore != null ? `\n**Score état final :** ${data.finalConditionScore}/10` : ''}${data.recommendations ? `\n**Recommandations :** ${data.recommendations}` : ''}${data.photosBefore?.[0] ? `\n**Photo Avant :** ${data.photosBefore[0]}` : ''}${data.photosAfter?.[0] ? `\n**Photo Après :** ${data.photosAfter[0]}` : ''}`,
            },
        }).unwrap();

        if (data.completed) {
            await updateIntervention({ id: interventionId, data: { status: 'completed', completionPercentage: data.completionPercentage } }).unwrap();
        } else if (data.completionPercentage != null) {
            await updateIntervention({ id: interventionId, data: { completionPercentage: data.completionPercentage } }).unwrap();
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-gray-100 rounded-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Interventions &amp; Déploiements</h1>
                        <p className="text-sm text-gray-500">Supervisez l’affectation et l’avancement des équipes sur le terrain.</p>
                    </div>
                </div>
            </div>

            {/* KPIs décisionnels (toutes interventions confondues) */}
            <InterventionsKPIs />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InterventionsByType />
                <InterventionsByZone />
            </div>

            {isFieldAgent ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-base font-semibold text-gray-900">Mes Interventions Assignées</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none w-full sm:w-48"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <select
                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl outline-none"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">Tous les statuts</option>
                                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                            <select
                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl outline-none"
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                            >
                                <option value="all">Toutes priorités</option>
                                <option value="urgent">Urgence</option>
                                <option value="high">Haute</option>
                                <option value="medium">Moyenne</option>
                                <option value="low">Basse</option>
                            </select>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="w-6 h-6 rounded-full border-2 border-green-500 border-t-transparent animate-spin mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Chargement...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left whitespace-nowrap">
                                <thead className="bg-gray-50/50 text-sm font-medium text-gray-800">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-4">Type</th>
                                        <th className="px-4 sm:px-6 py-4">Statut</th>
                                        <th className="px-4 sm:px-6 py-4">Priorité</th>
                                        <th className="px-4 sm:px-6 py-4">Assigné à</th>
                                        <th className="px-4 sm:px-6 py-4 hidden md:table-cell">Progression</th>
                                        <th className="px-4 sm:px-6 py-4 hidden sm:table-cell">Début</th>
                                        <th className="px-4 sm:px-6 py-4 hidden lg:table-cell">Durée</th>
                                        <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredInterventions.map((intervention) => (
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
                                            <td className="px-4 sm:px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${intervention.priority === 'urgent' ? 'bg-red-100 text-red-700' : intervention.priority === 'high' ? 'bg-orange-100 text-orange-700' : intervention.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {intervention.priority === 'urgent' ? 'Urgence' : intervention.priority === 'high' ? 'Haute' : intervention.priority === 'medium' ? 'Moyenne' : 'Basse'}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 text-sm text-gray-600">
                                                {intervention.agentName || 'Non assigné'}
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
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button
                                                        onClick={() => setSelectedIntervention(intervention)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                                    >
                                                        Détails
                                                    </button>
                                                    {isInterveningOrg && (
                                                        <button
                                                            onClick={() => setReportInterventionId(intervention.id)}
                                                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                                                            title="Rédiger un rapport"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <select
                                                        className="text-sm border border-gray-200 rounded-xl px-2 py-1.5 bg-white cursor-pointer outline-none focus:border-green-500"
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
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6 items-start">
                    {/* Panneau gauche : Liste des missions */}
                    <div className="bg-white border border-gray-100 rounded-2xl flex flex-col h-[700px] overflow-hidden">
                        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">Missions Actives</h2>
                                <p className="text-sm text-gray-500 mt-1">Sélectionnez une mission pour gérer ses interventions.</p>
                            </div>
                            <button
                                onClick={() => setIsCreateMissionOpen(true)}
                                className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
                                title="Créer une nouvelle mission"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
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
                                            ? "border-green-500 bg-green-50/30 ring-1 ring-green-500 shadow-sm"
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
                                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                                        <Flag className="w-8 h-8 text-green-400" />
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
                                                className="shrink-0 flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
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
                                                onClick={() => setShowTraceability(true)}
                                                className="mt-3 text-sm font-medium text-green-600 hover:underline flex items-center gap-1"
                                            >
                                                Voir la traçabilité de la mission <ArrowRight className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Traçabilité */}
                                {showTraceability && selectedMission?.reportId && (
                                    <InterventionsTraceability 
                                        reportId={selectedMission.reportId} 
                                        onClose={() => setShowTraceability(false)}
                                    />
                                )}

                                {/* Tableau des interventions */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-6">
                                    <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-base font-semibold text-gray-900">Registre des Interventions</h3>
                                            <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-semibold rounded-full">
                                                {filteredInterventions.length} / {interventions.length}
                                            </span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <input
                                                type="text"
                                                placeholder="Rechercher..."
                                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none w-full sm:w-48"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            <select
                                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl outline-none"
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                            >
                                                <option value="all">Tous statuts</option>
                                                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                            </select>
                                            <select
                                                className="px-3 py-1.5 text-sm border border-gray-200 rounded-xl outline-none"
                                                value={priorityFilter}
                                                onChange={(e) => setPriorityFilter(e.target.value)}
                                            >
                                                <option value="all">Toutes priorités</option>
                                                <option value="urgent">Urgence</option>
                                                <option value="high">Haute</option>
                                                <option value="medium">Moyenne</option>
                                                <option value="low">Basse</option>
                                            </select>
                                        </div>
                                    </div>
                                    {isLoading ? (
                                        <div className="p-12 text-center">
                                            <div className="w-6 h-6 rounded-full border-2 border-green-500 border-t-transparent animate-spin mx-auto mb-2" />
                                            <p className="text-sm text-gray-400">Chargement...</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-left whitespace-nowrap">
                                                <thead className="bg-gray-50/50 text-sm font-medium text-gray-800">
                                                    <tr>
                                                        <th className="px-6 py-4">Type</th>
                                                        <th className="px-6 py-4">Statut</th>
                                                        <th className="px-6 py-4">Priorité</th>
                                                        <th className="px-6 py-4">Assigné à</th>
                                                        <th className="px-6 py-4">Progression</th>
                                                        <th className="px-6 py-4">Début</th>
                                                        <th className="px-6 py-4">Durée</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 bg-white">
                                                    {filteredInterventions.map((intervention) => (
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
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${intervention.priority === 'urgent' ? 'bg-red-100 text-red-700' : intervention.priority === 'high' ? 'bg-orange-100 text-orange-700' : intervention.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                                                    {intervention.priority === 'urgent' ? 'Urgence' : intervention.priority === 'high' ? 'Haute' : intervention.priority === 'medium' ? 'Moyenne' : 'Basse'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                                {intervention.agentName || 'Non assigné'}
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
                                                                <div className="flex gap-2 justify-end items-center">
                                                                    <button
                                                                        onClick={() => setSelectedIntervention(intervention)}
                                                                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                                                                    >
                                                                        Détails
                                                                    </button>
                                                                    {isInterveningOrg && (
                                                                        <button
                                                                            onClick={() => setReportInterventionId(intervention.id)}
                                                                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                                                                            title="Rédiger un rapport"
                                                                        >
                                                                            <FileText className="w-4 h-4" />
                                                                        </button>
                                                                    )}
                                                                    <select
                                                                        className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white cursor-pointer outline-none focus:border-green-500"
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
            
            {isCreateMissionOpen && (
                <CreateMissionModal
                    onClose={() => setIsCreateMissionOpen(false)}
                    onSubmit={handleCreateMission}
                />
            )}

            {reportInterventionId && (
                <InterventionReportModal
                    interventionId={reportInterventionId}
                    onClose={() => setReportInterventionId(null)}
                    onSubmit={handleReport}
                />
            )}

            {selectedIntervention && (
                <>
                    <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedIntervention(null)} />
                    <InterventionDetailsPanel
                        intervention={selectedIntervention}
                        onClose={() => setSelectedIntervention(null)}
                    />
                </>
            )}
        </div>
    );
};