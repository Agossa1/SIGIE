import { baseApi } from "../../../stores/baseApi";
import type {
    Intervention,
    CreateInterventionDTO,
    InterventionStats,
    InterventionLog,
    CreateInterventionLogDTO,
} from "./interventions.types";

/**
 * RTK Query — Endpoints pour le module Interventions.
 */
export const interventionsRtkApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getInterventions: builder.query<Intervention[], void>({
            query: () => "/interventions",
            transformResponse: (response: { success: boolean; data: Intervention[] }) => response.data,
            providesTags: [{ type: 'Intervention', id: 'LIST' }],
        }),

        getInterventionsByMission: builder.query<Intervention[], string>({
            query: (missionId) => `/interventions/mission/${missionId}`,
            transformResponse: (response: { success: boolean; data: Intervention[] }) => response.data,
            providesTags: (_result, _error, missionId) => [{ type: 'Intervention' as const, id: missionId }],
        }),

        createIntervention: builder.mutation<Intervention, CreateInterventionDTO>({
            query: (body) => ({ url: "/interventions", method: "POST", body }),
            invalidatesTags: [{ type: 'Intervention', id: 'LIST' }],
        }),

        updateInterventionStatus: builder.mutation<Intervention, { id: string; status: string }>({
            query: ({ id, status }) => ({
                url: `/interventions/${id}/status`,
                method: "PATCH",
                body: { status },
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Intervention', id }],
        }),

        getTraceability: builder.query<TraceabilityChain, string>({
            query: (reportId) => `/interventions/traceability/${reportId}`,
            transformResponse: (response: { success: boolean; data: TraceabilityChain }) => response.data,
        }),

        getInterventionsStats: builder.query<InterventionStats, { municipalityId?: string; dateFrom?: string; dateTo?: string } | void>({
            query: (filters) => {
                const params = new URLSearchParams();
                if (filters?.municipalityId) params.set('municipalityId', filters.municipalityId);
                if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom);
                if (filters?.dateTo) params.set('dateTo', filters.dateTo);
                const qs = params.toString();
                return `/interventions/stats${qs ? `?${qs}` : ''}`;
            },
            transformResponse: (response: { success: boolean; data: InterventionStats }) => response.data,
            providesTags: [{ type: 'Intervention', id: 'STATS' }],
        }),

        // ── Logs (Journal d'intervention) ─────────────────────────────────

        getInterventionLogs: builder.query<InterventionLog[], string>({
            query: (interventionId) => `/interventions/${interventionId}/logs`,
            transformResponse: (response: { success: boolean; data: InterventionLog[] }) => response.data,
            providesTags: (_result, _error, id) => [{ type: 'Intervention', id: `logs-${id}` }],
        }),

        createInterventionLog: builder.mutation<void, { interventionId: string; log: CreateInterventionLogDTO }>({
            query: ({ interventionId, log }) => ({
                url: `/interventions/${interventionId}/logs`,
                method: "POST",
                body: log,
            }),
            invalidatesTags: (_result, _error, { interventionId }) => [
                { type: 'Intervention', id: `logs-${interventionId}` },
            ],
        }),
    }),
});

// Types locaux
interface TraceabilityReport {
    id: string;
    title: string;
    category: string;
    status: string;
    priority: string;
    reportedAt: string;
    municipalityName?: string;
}

interface TraceabilityMission {
    id: string;
    title: string;
    status: string;
    scheduledAt?: string;
    completedAt?: string;
    teamName?: string;
    completionPercentage?: number;
}

interface TraceabilityIntervention {
    id: string;
    type: string;
    status: string;
    startedAt?: string;
    endedAt?: string;
    teamName?: string;
    completionPercentage?: number;
}

interface TraceabilityChain {
    report: TraceabilityReport | null;
    missions: TraceabilityMission[];
    interventions: TraceabilityIntervention[];
}

export const {
    useGetInterventionsQuery,
    useGetInterventionsByMissionQuery,
    useCreateInterventionMutation,
    useUpdateInterventionStatusMutation,
    useGetTraceabilityQuery,
    useGetInterventionsStatsQuery,
    useGetInterventionLogsQuery,
    useCreateInterventionLogMutation,
} = interventionsRtkApi;