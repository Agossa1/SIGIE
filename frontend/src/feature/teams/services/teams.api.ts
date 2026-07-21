import { api } from "../../../lib/apiClient";
import type { Team, CreateTeamDTO } from "./teams.types";

export interface TeamLocation {
    team_id: string;
    team_name: string;
    team_status: string;
    user_id: string;
    check_in_time: string;
    latitude: number;
    longitude: number;
}

export interface TeamMember {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    role_in_team: string;
    joined_at: string;
}

export const teamsApi = {
    getAllTeams: async (): Promise<Team[]> => {
        const response = await api.get<{ success: boolean; data: Team[] }>("/teams");
        return response.data;
    },
    getPaginatedTeams: async (page: number, limit: number, search?: string): Promise<{ data: Team[], meta: { total: number } }> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });
        if (search) params.append("search", search);
        
        const response = await api.get<{ success: boolean; data: Team[]; meta: { total: number } }>(`/teams?${params.toString()}`);
        return { data: response.data, meta: response.meta };
    },
    getLocations: async (): Promise<TeamLocation[]> => {
        const response = await api.get<{ success: boolean; data: TeamLocation[] }>("/teams/locations");
        return response.data;
    },
    getTeamMembers: async (teamId: string): Promise<TeamMember[]> => {
        const response = await api.get<{ success: boolean; data: TeamMember[] }>(`/teams/${teamId}/members`);
        return response.data ?? [];
    },
    addTeamMember: async (teamId: string, userId: string, role: string = 'member'): Promise<void> => {
        await api.post<{ success: boolean }>(`/teams/${teamId}/members`, { userId, role });
    },
    removeTeamMember: async (teamId: string, userId: string): Promise<void> => {
        await api.delete(`/teams/${teamId}/members/${userId}`);
    },
    createTeam: async (data: CreateTeamDTO): Promise<Team> => {
        const response = await api.post<{ success: boolean; data: Team }>("/teams", data);
        return response.data;
    },
    updateTeam: async (id: string, data: Partial<CreateTeamDTO>): Promise<Team> => {
        const response = await api.patch<{ success: boolean; data: Team }>(`/teams/${id}`, data);
        return response.data;
    },
    checkIn: async (data: { teamId: string; latitude: number; longitude: number }): Promise<void> => {
        await api.post<{ success: boolean }>("/teams/check-in", data);
    },
    deleteTeam: async (id: string): Promise<void> => {
        await api.delete(`/teams/${id}`);
    },
    
};

