import { createAsyncThunk } from "@reduxjs/toolkit";
import { reportsApi } from "./reports.api";
import type {
    CreateReportDTO, UpdateReportDTO,
    CreateCommentDTO, CreateAssignmentDTO,
    } from "./reports.types";

type ApiError = Error & { data?: { errors?: Array<{ field?: string; message: string }> } };

function extractErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error) {
        const apiErr = error as ApiError;
        if (apiErr.data?.errors && Array.isArray(apiErr.data.errors)) {
            return apiErr.data.errors.map(e => `${e.field || ''}: ${e.message}`).join(" | ");
        }
        return error.message || fallback;
    }
    return fallback;
}

export const fetchReports = createAsyncThunk(
    "reports/fetchReports",
    async (_, { rejectWithValue }) => {
        try {
            return await reportsApi.getAllReports();
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, "Erreur lors de la récupération des rapports"));
        }
    }
);

export const fetchReportById = createAsyncThunk(
    "reports/fetchReportById",
    async (id: string, { rejectWithValue }) => {
        try {
            return await reportsApi.getReportById(id);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, "Rapport introuvable"));
        }
    }
);

export const createReport = createAsyncThunk(
    "reports/createReport",
    async (data: CreateReportDTO, { rejectWithValue }) => {
        try {
            return await reportsApi.createReport(data);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, "Erreur lors de la création du rapport"));
        }
    }
);

export const updateReport = createAsyncThunk(
    "reports/updateReport",
    async ({ id, data }: { id: string; data: UpdateReportDTO }, { rejectWithValue }) => {
        try {
            return await reportsApi.updateReport(id, data);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, "Erreur lors de la mise à jour du rapport"));
        }
    }
);

export const deleteReport = createAsyncThunk(
    "reports/deleteReport",
    async (id: string, { rejectWithValue }) => {
        try {
            await reportsApi.deleteReport(id);
            return id;
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, "Erreur lors de la suppression du rapport"));
        }
    }
);

export const addReportComment = createAsyncThunk(
    "reports/addComment",
    async ({ reportId, data }: { reportId: string; data: CreateCommentDTO }, { rejectWithValue }) => {
        try {
            return await reportsApi.addComment(reportId, data);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, "Erreur lors de l'ajout du commentaire"));
        }
    }
);

export const assignReport = createAsyncThunk(
    "reports/assignReport",
    async ({ reportId, data }: { reportId: string; data: CreateAssignmentDTO }, { rejectWithValue }) => {
        try {
            return await reportsApi.assignReport(reportId, data);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, "Erreur lors de l'assignation du rapport"));
        }
    }
);