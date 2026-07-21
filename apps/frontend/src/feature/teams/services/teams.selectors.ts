import type { RootState } from "../../../stores/store";

export const selectAllTeams = (state: RootState) => state.teams?.teams ?? [];
export const selectTotalTeams = (state: RootState) => state.teams?.totalTeams ?? 0;
export const selectTeamLocations = (state: RootState) => state.teams?.locations ?? [];
export const selectTeamMembers = (teamId: string) => (state: RootState) => state.teams?.membersByTeam[teamId] ?? [];
export const selectTeamsLoading = (state: RootState) => state.teams?.isLoading ?? false;
export const selectTeamLocationsLoading = (state: RootState) => state.teams?.isLocationsLoading ?? false;
export const selectTeamsError = (state: RootState) => state.teams?.error ?? null;
