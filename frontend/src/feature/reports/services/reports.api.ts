import { api } from "../../../lib/apiClient";
import type {
    TechnicianReport, CreateReportDTO, UpdateReportDTO,
    CreateCommentDTO, CreateAssignmentDTO, ReportComment,
} from "./reports.types";

export const reportsApi = {
    getAllReports: async (): Promise<TechnicianReport[]> => {
        const response = await api.get<{ success: boolean; data: TechnicianReport[]; meta: unknown }>("/reports", { signal: AbortSignal.timeout(30000) });
        return response.data ?? [];
    },

    getReportById: async (id: string): Promise<TechnicianReport> => {
        const response = await api.get<{ success: boolean; data: TechnicianReport }>(`/reports/${id}`);
        return response.data;
    },

    createReport: async (data: CreateReportDTO): Promise<TechnicianReport> => {
        const response = await api.post<{ success: boolean; data: TechnicianReport }>("/reports", data);
        return response.data;
    },

    updateReport: async (id: string, data: UpdateReportDTO): Promise<TechnicianReport> => {
        const response = await api.put<{ success: boolean; data: TechnicianReport }>(`/reports/${id}`, data);
        return response.data;
    },

    deleteReport: async (id: string): Promise<void> => {
        await api.delete<{ success: boolean }>(`/reports/${id}`);
    },

    addComment: async (reportId: string, data: CreateCommentDTO): Promise<ReportComment> => {
        const response = await api.post<{ success: boolean; data: ReportComment }>(`/reports/${reportId}/comments`, data);
        return response.data;
    },

    assignReport: async (reportId: string, data: CreateAssignmentDTO): Promise<TechnicianReport> => {
        const response = await api.post<{ success: boolean; data: TechnicianReport }>(`/reports/${reportId}/assign`, data);
        return response.data;
    },
};