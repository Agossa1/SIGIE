import { api } from "../../../lib/apiClient";
import type { Mission, CreateMissionDTO, UpdateMissionDTO, AssignMissionDTO, CreateMissionReportDTO, MissionReport, MissionDetails, MissionChecklist } from "./missions.types";

export const missionsApi = {
    getAllMissions: async (): Promise<Mission[]> => {
        const response = await api.get<{ success: boolean; data: Mission[] }>("/missions");
        return response.data;
    },

    getMissionById: async (id: string): Promise<MissionDetails> => {
        const response = await api.get<{ success: boolean; data: MissionDetails }>(`/missions/${id}`);
        return response.data;
    },

    createMission: async (data: CreateMissionDTO): Promise<{ id: string }> => {
        const response = await api.post<{ success: boolean; data: { id: string } }>("/missions", data);
        return response.data;
    },

    updateMission: async (id: string, data: UpdateMissionDTO): Promise<void> => {
        await api.patch<{ success: boolean; message: string }>(`/missions/${id}`, data);
    },

    updateMissionStatus: async (id: string, status: string, forceCompleteInterventions?: boolean): Promise<void> => {
        await api.patch<{ success: boolean; message: string }>(`/missions/${id}/status`, { status, forceCompleteInterventions });
    },

    assignMission: async (id: string, data: AssignMissionDTO): Promise<void> => {
        await api.post<{ success: boolean; message: string }>(`/missions/${id}/assignments`, data);
    },

    addMissionReport: async (id: string, data: CreateMissionReportDTO): Promise<MissionReport> => {
        const response = await api.post<{ success: boolean; data: MissionReport }>(`/missions/${id}/reports`, data);
        return response.data;
    },

    getChecklist: async (id: string): Promise<MissionChecklist[]> => {
        const response = await api.get<{ success: boolean; data: MissionChecklist[] }>(`/missions/${id}/checklist`);
        return response.data;
    },

    addChecklistItem: async (id: string, label: string, order: number): Promise<MissionChecklist> => {
        const response = await api.post<{ success: boolean; data: MissionChecklist }>(`/missions/${id}/checklist`, { label, order });
        return response.data;
    },

    toggleChecklistItem: async (id: string, itemId: string): Promise<MissionChecklist> => {
        const response = await api.patch<{ success: boolean; data: MissionChecklist }>(`/missions/${id}/checklist/${itemId}`);
        return response.data;
    },

    deleteChecklistItem: async (id: string, itemId: string): Promise<void> => {
        await api.delete<{ success: boolean }>(`/missions/${id}/checklist/${itemId}`);
    }
};
