import type { RootState } from "../../../stores/store";

export const selectAllRoles = (state: RootState) => state.roles?.roles ?? [];
export const selectRolesLoading = (state: RootState) => state.roles?.isLoading ?? false;
export const selectRolesError = (state: RootState) => state.roles?.error ?? null;
