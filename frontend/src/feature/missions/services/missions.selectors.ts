import type { RootState } from "../../../stores/store";

export const selectAllMissions = (state: RootState) => state.missions.missions;
export const selectMissionsLoading = (state: RootState) => state.missions.loading;
export const selectMissionsError = (state: RootState) => state.missions.error;
export const selectCurrentMission = (state: RootState) => state.missions.currentMission;
