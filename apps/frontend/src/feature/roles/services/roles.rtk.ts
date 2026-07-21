import { baseApi } from "../../../stores/baseApi";
import type { RoleRecord } from "./roles.api";

/**
 * RTK Query — Endpoints pour le module Rôles.
 * Remplace roles.api.ts + roles.thunk.ts + roles.slice.ts + roles.selectors.ts.
 */
export const rolesRtkApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<RoleRecord[], void>({
      query: () => "/roles",
      transformResponse: (response: { success: boolean; data: RoleRecord[] }) => response.data,
      providesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    updateRole: builder.mutation<RoleRecord, { id: string; data: Partial<RoleRecord> }>({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: { success: boolean; data: RoleRecord }) => response.data,
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useUpdateRoleMutation,
} = rolesRtkApi;