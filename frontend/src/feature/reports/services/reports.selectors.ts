import type { RootState } from "../../../stores/store";

export const selectAllReports       = (state: RootState) => state.reports?.reports ?? [];
export const selectSelectedReport   = (state: RootState) => state.reports?.selectedReport ?? null;
export const selectReportsLoading   = (state: RootState) => state.reports?.isLoading ?? false;
export const selectDetailLoading    = (state: RootState) => state.reports?.isDetailLoading ?? false;
export const selectReportsError     = (state: RootState) => state.reports?.error ?? null;
