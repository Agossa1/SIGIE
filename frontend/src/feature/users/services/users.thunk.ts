import { createAsyncThunk } from "@reduxjs/toolkit";
import { usersApi } from "./users.api";
import type { UserWithRoles } from "./users.api";

export const fetchUsers = createAsyncThunk<UserWithRoles[], void, { rejectValue: string }>(
    "users/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            return await usersApi.getAllUsers();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Impossible de récupérer les utilisateurs");
        }
    }
);

export const assignUserRole = createAsyncThunk<UserWithRoles, { userId: string; role: string }, { rejectValue: string }>(
    "users/assignRole",
    async ({ userId, role }, { rejectWithValue }) => {
        try {
            return await usersApi.assignRole(userId, role);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Impossible d'assigner le rôle");
        }
    }
);
