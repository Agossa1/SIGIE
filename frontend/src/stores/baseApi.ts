import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * API de base pour RTK Query.
 * Gère la configuration commune comme l'URL de base et les cookies.
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      // Les cookies HttpOnly sont gérés automatiquement par le navigateur
      // car nous utilisons credentials: 'include' dans fetchBaseQuery
      return headers;
    },
    // Configuration pour inclure les cookies (HttpOnly)
    credentials: 'include',
  }),
  tagTypes: ['Auth', 'Gis', 'Territory', 'User', 'Role', 'Team', 'Mission', 'Intervention', 'Report'],
  endpoints: () => ({}),
});
