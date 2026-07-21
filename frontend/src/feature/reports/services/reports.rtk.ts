import { baseApi } from "../../../stores/baseApi";
import type {
    TechnicianReport,
    CreateReportDTO,
    UpdateReportDTO,
        PaginatedResponse,
    CreateCommentDTO,
    CreateAssignmentDTO,
    ReportComment,
    ReportFilters,
} from "./reports.types";

/**
 * RTK Query — Endpoints pour le module Reports (Signalements).
 * Remplace reports.api.ts + reports.thunk.ts + reports.slice.ts + reports.selectors.ts.
 */
export const reportsRtkApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getReports: builder.query<PaginatedResponse<TechnicianReport>, ReportFilters | void>({
            query: (filters) => {
                const params = new URLSearchParams();
                if (filters) {
                    Object.entries(filters).forEach(([k, v]) => {
                        if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
                    });
                }
                return `/reports?${params.toString()}`;
            },
            transformResponse: (response: { success: boolean; data: PaginatedResponse<TechnicianReport> }) => response.data,
            providesTags: [{ type: 'Report', id: 'LIST' }],
        }),

        getReportById: builder.query<TechnicianReport, string>({
            query: (id) => `/reports/${id}`,
            transformResponse: (response: { success: boolean; data: TechnicianReport }) => response.data,
            providesTags: (_result, _error, id) => [{ type: 'Report', id }],
        }),

        createReport: builder.mutation<TechnicianReport, CreateReportDTO>({
            query: (body) => ({ url: "/reports", method: "POST", body }),
            invalidatesTags: [{ type: 'Report', id: 'LIST' }],
        }),

        updateReport: builder.mutation<TechnicianReport, { id: string; data: UpdateReportDTO }>({
            query: ({ id, data }) => ({ url: `/reports/${id}`, method: "PUT", body: data }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Report', id }],
        }),

        deleteReport: builder.mutation<void, string>({
            query: (id) => ({ url: `/reports/${id}`, method: "DELETE" }),
            invalidatesTags: [{ type: 'Report', id: 'LIST' }],
        }),

        addReportComment: builder.mutation<ReportComment, { reportId: string; data: CreateCommentDTO }>({
            query: ({ reportId, data }) => ({ url: `/reports/${reportId}/comments`, method: "POST", body: data }),
            invalidatesTags: (_result, _error, { reportId }) => [{ type: 'Report', id: reportId }],
        }),

        assignReport: builder.mutation<void, { reportId: string; data: CreateAssignmentDTO }>({
            query: ({ reportId, data }) => ({ url: `/reports/${reportId}/assign`, method: "POST", body: data }),
            invalidatesTags: [{ type: 'Report', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetReportsQuery,
    useGetReportByIdQuery,
    useCreateReportMutation,
    useUpdateReportMutation,
    useDeleteReportMutation,
    useAddReportCommentMutation,
    useAssignReportMutation,
} = reportsRtkApi;