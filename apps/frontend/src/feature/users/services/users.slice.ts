import { createSlice } from "@reduxjs/toolkit";
import type { UserWithRoles } from "./users.api";
import { fetchUsers, assignUserRole } from "./users.thunk";

export interface UsersState {
    users: UserWithRoles[];
    isLoading: boolean;
    error: string | null;
}

const initialState: UsersState = {
    users: [],
    isLoading: false,
    error: null,
};

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        clearUsersError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(assignUserRole.fulfilled, (state, action) => {
                const index = state.users.findIndex((u) => u.id === action.payload.id);
                if (index !== -1) {
                    state.users[index] = action.payload;
                }
            });
    }
});

export const { clearUsersError } = usersSlice.actions;
export const usersReducer = usersSlice.reducer;
