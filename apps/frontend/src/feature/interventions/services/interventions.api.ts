import { api } from "../../../lib/apiClient";
import type {
  Intervention,
  CreateInterventionDTO,
  CreateInterventionReportDTO,
  FieldAssignmentStatus,
  FieldInterventionReport,
} from "./interventions.types";

export const interventionsApi = {
  getInterventionsByMission: async (missionId: string): Promise<Intervention[]> => {
    const response = await api.get<{ success: boolean; data: Intervention[] }>(
      `/interventions/mission/${missionId}`
    );
    return response.data;
  },

  getInterventionsByTeam: async (): Promise<Intervention[]> => {
    const response = await api.get<{ success: boolean; data: Intervention[] }>(
      `/interventions/my-team`
    );
    return response.data;
  },

  createIntervention: async (data: CreateInterventionDTO): Promise<{ id: string }> => {
    const response = await api.post<{ success: boolean; data: { id: string } }>(
      `/interventions`,
      data
    );
    return response.data;
  },

  updateInterventionStatus: async (id: string, status: FieldAssignmentStatus): Promise<void> => {
    await api.patch<{ success: boolean; message: string }>(`/interventions/${id}/status`, {
      status,
    });
  },

  addInterventionReport: async (
    id: string,
    data: CreateInterventionReportDTO
  ): Promise<FieldInterventionReport> => {
    const response = await api.post<{ success: boolean; data: FieldInterventionReport }>(
      `/interventions/${id}/reports`,
      data
    );
    return response.data;
  },
};
