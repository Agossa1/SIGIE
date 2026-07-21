import { createSlice } from "@reduxjs/toolkit";
import type { RoleRecord } from "./roles.api";
import { fetchRoles, updateRole } from "./roles.thunk";

export interface RolesState {
    roles: RoleRecord[];
    isLoading: boolean;
    error: string | null;
}

const initialState: RolesState = {
    roles: [],
    isLoading: false,
    error: null,
};

const rolesSlice = createSlice({
    name: "roles",
    initialState,
    reducers: {
        clearRolesError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchRoles.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.isLoading = false;
                state.roles = action.payload;
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updateRole.fulfilled, (state, action) => {
                const index = state.roles.findIndex((r) => r.id === action.payload.id);
                if (index !== -1) {
                    state.roles[index] = action.payload;
                }
            });
    }
});

export const { clearRolesError } = rolesSlice.actions;
export const rolesReducer = rolesSlice.reducer;
