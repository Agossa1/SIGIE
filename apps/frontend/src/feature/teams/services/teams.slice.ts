import { createSlice } from "@reduxjs/toolkit";
import type { Team } from "./teams.types";
import type { TeamLocation, TeamMember } from "./teams.api";
import { 
    fetchTeams, 
    fetchPaginatedTeams,
    fetchTeamLocations, 
    fetchTeamMembers, 
    createTeam, 
    updateTeam, 
    deleteTeam 
} from "./teams.thunk";

export interface TeamsState {
    teams: Team[];
    locations: TeamLocation[];
    membersByTeam: Record<string, TeamMember[]>;
    totalTeams: number;
    isLoading: boolean;
    isLocationsLoading: boolean;
    error: string | null;
}

const initialState: TeamsState = {
    teams: [],
    locations: [],
    membersByTeam: {},
    totalTeams: 0,
    isLoading: false,
    isLocationsLoading: false,
    error: null,
};

const teamsSlice = createSlice({
    name: "teams",
    initialState,
    reducers: {
        clearTeamsError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Teams
            .addCase(fetchTeams.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTeams.fulfilled, (state, action) => {
                state.isLoading = false;
                state.teams = action.payload;
            })
            .addCase(fetchTeams.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Paginated Teams
            .addCase(fetchPaginatedTeams.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPaginatedTeams.fulfilled, (state, action) => {
                state.isLoading = false;
                state.teams = action.payload.data;
                state.totalTeams = action.payload.meta.total;
            })
            .addCase(fetchPaginatedTeams.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Locations
            .addCase(fetchTeamLocations.pending, (state) => {
                state.isLocationsLoading = true;
                state.error = null;
            })
            .addCase(fetchTeamLocations.fulfilled, (state, action) => {
                state.isLocationsLoading = false;
                state.locations = action.payload;
            })
            .addCase(fetchTeamLocations.rejected, (state, action) => {
                state.isLocationsLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Members
            .addCase(fetchTeamMembers.fulfilled, (state, action) => {
                state.membersByTeam[action.payload.teamId] = action.payload.members;
            })
            // Create Team
            .addCase(createTeam.fulfilled, (state, action) => {
                state.teams.push(action.payload);
            })
            // Update Team
            .addCase(updateTeam.fulfilled, (state, action) => {
                const index = state.teams.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.teams[index] = action.payload;
                }
            })
            // Delete Team
            .addCase(deleteTeam.fulfilled, (state, action) => {
                state.teams = state.teams.filter(t => t.id !== action.payload);
                delete state.membersByTeam[action.payload];
            });
    }
});

export const { clearTeamsError } = teamsSlice.actions;
export const teamsReducer = teamsSlice.reducer;
