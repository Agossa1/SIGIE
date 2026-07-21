import { baseApi } from "../../../stores/baseApi";
import type { Team, TeamMember } from "./teams.types";

/**
 * RTK Query — Endpoints pour le module Teams (Équipes & GPS).
 * Remplace teams.api.ts + teams.thunk.ts + teams.slice.ts + teams.selectors.ts.
 */
export const teamsRtkApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTeams: builder.query<Team[], void>({
            query: () => "/teams",
            transformResponse: (response: { success: boolean; data: Team[] }) => response.data,
            providesTags: [{ type: 'Team', id: 'LIST' }],
        }),

        getTeamMembers: builder.query<TeamMember[], string>({
            query: (teamId) => `/teams/${teamId}/members`,
            transformResponse: (response: { success: boolean; data: TeamMember[] }) => response.data,
            providesTags: (result, _error, _teamId) =>
                result ? result.map(({ id }) => ({ type: 'Team' as const, id })) : [],
        }),

        createTeam: builder.mutation<Team, Partial<Team>>({
            query: (body) => ({ url: "/teams", method: "POST", body }),
            invalidatesTags: [{ type: 'Team', id: 'LIST' }],
        }),

        deleteTeam: builder.mutation<void, string>({
            query: (id) => ({ url: `/teams/${id}`, method: "DELETE" }),
            invalidatesTags: [{ type: 'Team', id: 'LIST' }],
        }),

        addTeamMember: builder.mutation<TeamMember, { teamId: string; userId: string }>({
            query: ({ teamId, userId }) => ({
                url: `/teams/${teamId}/members`,
                method: "POST",
                body: { userId },
            }),
            invalidatesTags: (_result, _error, { teamId }) => [{ type: 'Team', id: teamId }],
        }),

        removeTeamMember: builder.mutation<void, { teamId: string; memberId: string }>({
            query: ({ teamId, memberId }) => ({
                url: `/teams/${teamId}/members/${memberId}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, { teamId }) => [{ type: 'Team', id: teamId }],
        }),

        getTeamLocations: builder.query<any[], void>({
            query: () => "/teams/locations",
            transformResponse: (response: { success: boolean; data: any[] }) => response.data,
            providesTags: [{ type: 'Team', id: 'LOCATIONS' }],
        }),
    }),
});

export const {
    useGetTeamsQuery,
    useGetTeamMembersQuery,
    useCreateTeamMutation,
    useDeleteTeamMutation,
    useAddTeamMemberMutation,
    useRemoveTeamMemberMutation,
    useGetTeamLocationsQuery,
} = teamsRtkApi;