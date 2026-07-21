import type { RootState } from "../../../stores/store";

export const selectAllInterventions = (state: RootState) =>
  state.interventions.interventions;
export const selectInterventionsLoading = (state: RootState) =>
  state.interventions.loading;
export const selectInterventionsError = (state: RootState) =>
  state.interventions.error;
