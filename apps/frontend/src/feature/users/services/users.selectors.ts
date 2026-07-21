import type { RootState } from "../../../stores/store";

export const selectAllUsers = (state: RootState) => state.users?.users ?? [];
export const selectUsersLoading = (state: RootState) => state.users?.isLoading ?? false;
export const selectUsersError = (state: RootState) => state.users?.error ?? null;
