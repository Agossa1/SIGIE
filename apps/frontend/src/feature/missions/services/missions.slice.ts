import { createSlice } from "@reduxjs/toolkit";
import type { Mission, MissionDetails } from "./missions.types";
import { fetchMissions, fetchMissionById } from "./missions.thunk";

export interface MissionsState {
  missions: Mission[];
  currentMission: MissionDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: MissionsState = {
  missions: [],
  currentMission: null,
  loading: false,
  error: null,
};

const missionsSlice = createSlice({
  name: "missions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchMissions
    builder.addCase(fetchMissions.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMissions.fulfilled, (state, action) => {
      state.loading = false;
      const now = new Date();
      const TERMINAL = ['completed', 'validated', 'cancelled'];
      state.missions = action.payload.map(m => ({
        ...m,
        isOverdue: !!(
          m.dueDate &&
          !TERMINAL.includes(m.status) &&
          new Date(m.dueDate) < now
        ),
      }));
    });
    builder.addCase(fetchMissions.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    
    // fetchMissionById
    builder.addCase(fetchMissionById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchMissionById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentMission = action.payload;
    });
    builder.addCase(fetchMissionById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const missionsReducer = missionsSlice.reducer;
