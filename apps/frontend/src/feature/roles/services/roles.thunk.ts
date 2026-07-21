import { createAsyncThunk } from "@reduxjs/toolkit";
import { rolesApi } from "./roles.api";
import type { RoleRecord } from "./roles.api";

export const fetchRoles = createAsyncThunk<RoleRecord[], void, { rejectValue: string }>(
    "roles/fetchAll",
    async (_, { rejectWithValue }) => {
        try {
            return await rolesApi.getAllRoles();
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Impossible de récupérer les rôles");
        }
    }
);

export const updateRole = createAsyncThunk<RoleRecord, { id: string, data: Partial<RoleRecord> }, { rejectValue: string }>(
    "roles/update",
    async ({ id, data }, { rejectWithValue }) => {
        try {
            return await rolesApi.updateRole(id, data);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Impossible de mettre à jour le rôle");
        }
    }
);
