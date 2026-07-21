import { baseApi } from "../../../stores/baseApi";
import type {
    Mission,
    MissionDetails,
    CreateMissionDTO,
    UpdateMissionDTO,
    AssignMissionDTO,
    CreateMissionReportDTO,
        MissionChecklist,
} from "./missions.types";

/**
 * RTK Query — Endpoints pour le module Missions.
 * Remplace missions.api.ts + missions.thunk.ts + missions.slice.ts + missions.selectors.ts.
 */
export const missionsRtkApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMissions: builder.query<Mission[], void>({
            query: () => "/missions",
            transformResponse: (response: { success: boolean; data: Mission[] }) => response.data,
            providesTags: [{ type: 'Mission', id: 'LIST' }],
        }),

        getMissionById: builder.query<MissionDetails, string>({
            query: (id) => `/missions/${id}`,
            transformResponse: (response: { success: boolean; data: MissionDetails }) => response.data,
            providesTags: (_result, _error, id) => [{ type: 'Mission', id }],
        }),

        createMission: builder.mutation<{ id: string }, CreateMissionDTO>({
            query: (body) => ({ url: "/missions", method: "POST", body }),
            invalidatesTags: [{ type: 'Mission', id: 'LIST' }],
        }),

        updateMission: builder.mutation<void, { id: string; data: UpdateMissionDTO }>({
            query: ({ id, data }) => ({ url: `/missions/${id}`, method: "PATCH", body: data }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Mission', id }],
        }),

        updateMissionStatus: builder.mutation<void, { id: string; status: string; forceCompleteInterventions?: boolean }>({
            query: ({ id, status, forceCompleteInterventions }) => ({
                url: `/missions/${id}/status`,
                method: "PATCH",
                body: { status, forceCompleteInterventions },
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Mission', id }],
        }),

        assignMissionUsers: builder.mutation<void, { id: string; data: AssignMissionDTO }>({
            query: ({ id, data }) => ({
                url: `/missions/${id}/assignments`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Mission', id }],
        }),

        addMissionReport: builder.mutation<{ id: string }, { id: string; data: CreateMissionReportDTO }>({
            query: ({ id, data }) => ({
                url: `/missions/${id}/reports`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Mission', id }],
        }),

        getMissionChecklist: builder.query<MissionChecklist[], string>({
            query: (id) => `/missions/${id}/checklist`,
            transformResponse: (response: { success: boolean; data: MissionChecklist[] }) => response.data,
            providesTags: (_result, _error, id) => [{ type: 'Mission', id }],
        }),
    }),
});

export const {
    useGetMissionsQuery,
    useGetMissionByIdQuery,
    useCreateMissionMutation,
    useUpdateMissionMutation,
    useUpdateMissionStatusMutation,
    useAssignMissionUsersMutation,
    useAddMissionReportMutation,
    useGetMissionChecklistQuery,
} = missionsRtkApi;