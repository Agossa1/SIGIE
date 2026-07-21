import type { RootState } from "../../../stores/store"

export const selectPasswordLoading = (state: RootState) => state.password.isLoading
export const selectPasswordError = (state: RootState) => state.password.error
export const selectPasswordSuccessMessage = (state: RootState) => state.password.successMessage
