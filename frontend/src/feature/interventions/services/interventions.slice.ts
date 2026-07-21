import { createSlice } from "@reduxjs/toolkit";
import type { Intervention } from "./interventions.types";
import {
  fetchInterventionsByMission,
  fetchInterventionsByTeam,
  createIntervention,
  updateInterventionStatus,
} from "./interventions.thunk";

export interface InterventionsState {
  interventions: Intervention[];
  loading: boolean;
  error: string | null;
}

const initialState: InterventionsState = {
  interventions: [],
  loading: false,
  error: null,
};

const interventionsSlice = createSlice({
  name: "interventions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchInterventionsByMission
    builder.addCase(fetchInterventionsByMission.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchInterventionsByMission.fulfilled, (state, action) => {
      state.loading = false;
      state.interventions = action.payload;
    });
    builder.addCase(fetchInterventionsByMission.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // fetchInterventionsByTeam
    builder.addCase(fetchInterventionsByTeam.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchInterventionsByTeam.fulfilled, (state, action) => {
      state.loading = false;
      state.interventions = action.payload;
    });
    builder.addCase(fetchInterventionsByTeam.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // createIntervention
    builder.addCase(createIntervention.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createIntervention.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(createIntervention.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // updateInterventionStatus
    builder.addCase(updateInterventionStatus.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateInterventionStatus.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(updateInterventionStatus.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const interventionsReducer = interventionsSlice.reducer;
