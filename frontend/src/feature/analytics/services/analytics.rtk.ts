import { baseApi } from "../../../stores/baseApi";

export interface AnalyticsSummary {
    reports: { total: number; resolved: number; active: number; resolutionRate: number };
    missions: { total: number; validated: number; completionRate: number };
    sla: { total: number; withinSla: number; complianceRate: number };
    categories: { name: string; count: number }[];
    priorities: { name: string; count: number }[];
}

export const analyticsRtkApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAnalyticsSummary: builder.query<AnalyticsSummary, void>({
            query: () => "/analytics/summary",
            transformResponse: (response: { success: boolean; data: AnalyticsSummary }) => response.data,
            // Les données analytics sont re-fetchées à chaque visite de dashboard
            keepUnusedDataFor: 60,
        }),
    }),
});

export const { useGetAnalyticsSummaryQuery } = analyticsRtkApi;