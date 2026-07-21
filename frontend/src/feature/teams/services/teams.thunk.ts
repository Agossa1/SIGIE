import { createAsyncThunk } from "@reduxjs/toolkit";
import { teamsApi, type TeamLocation, type TeamMember } from "./teams.api";
import type { Team, CreateTeamDTO } from "./teams.types";

export const fetchTeams = createAsyncThunk<Team[], void, { rejectValue: string }>(
    "teams/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            return await teamsApi.getAllTeams();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Impossible de récupérer les équipes");
        }
    }
);

export const fetchPaginatedTeams = createAsyncThunk<{ data: Team[], meta: { total: number } }, { page: number, limit: number, search?: string }, { rejectValue: string }>(
    "teams/fetchPaginated",
    async ({ page, limit, search }, { rejectWithValue }) => {
        try {
            return await teamsApi.getPaginatedTeams(page, limit, search);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Impossible de récupérer les équipes");
        }
    }
);

export const fetchTeamLocations = createAsyncThunk<TeamLocation[], void, { rejectValue: string }>(
    "teams/fetchLocations",
    async (_, { rejectWithValue }) => {
        try {
            return await teamsApi.getLocations();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Impossible de récupérer les positions");
        }
    }
);

export const fetchTeamMembers = createAsyncThunk<{ teamId: string, members: TeamMember[] }, string, { rejectValue: string }>(
    "teams/fetchMembers",
    async (teamId, { rejectWithValue }) => {
        try {
            const members = await teamsApi.getTeamMembers(teamId);
            return { teamId, members };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Impossible de récupérer les membres");
        }
    }
);

export const createTeam = createAsyncThunk<Team, CreateTeamDTO, { rejectValue: string }>(
    "teams/create",
    async (data, { rejectWithValue }) => {
        try {
            return await teamsApi.createTeam(data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Impossible de créer l'équipe");
        }
    }
);

export const updateTeam = createAsyncThunk<Team, { id: string, data: Partial<CreateTeamDTO> }, { rejectValue: string }>(
    "teams/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            return await teamsApi.updateTeam(id, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Impossible de mettre à jour l'équipe");
        }
    }
);

export const deleteTeam = createAsyncThunk<string, string, { rejectValue: string }>(
    "teams/delete",
    async (id, { rejectWithValue }) => {
        try {
            await teamsApi.deleteTeam(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Impossible de supprimer l'équipe");
        }
    }
);

export const addTeamMember = createAsyncThunk<void, { teamId: string, userId: string, role?: string }, { rejectValue: string }>(
    "teams/addMember",
    async ({ teamId, userId, role }, { rejectWithValue }) => {
        try {
            await teamsApi.addTeamMember(teamId, userId, role);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Impossible d'ajouter le membre");
        }
    }
);

export const removeTeamMember = createAsyncThunk<void, { teamId: string, userId: string }, { rejectValue: string }>(
    "teams/removeMember",
    async ({ teamId, userId }, { rejectWithValue }) => {
        try {
            await teamsApi.removeTeamMember(teamId, userId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Impossible de retirer le membre");
        }
    }
);
