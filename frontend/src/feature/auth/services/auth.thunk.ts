import { createAsyncThunk } from "@reduxjs/toolkit";
import type { CreateUserDTO, LoginCredentials, VerifyAccountDTO } from "./auth.types";
import { authApi } from "./auth.api";

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

export const registerThunk = createAsyncThunk("auth/register",
    async (data: CreateUserDTO, { rejectWithValue }) => {
        try {
            return await authApi.register(data);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, "Une erreur est survenue lors de l'inscription."));
        }
    })

export const loginThunk = createAsyncThunk("auth/login",
    async (data: LoginCredentials, { rejectWithValue }) => {
        try {
            return await authApi.login(data)
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, "Une erreur est survenue lors de la connexion."))
        }
    }
)

export const logoutThunk = createAsyncThunk("auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await authApi.logout();
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, "Une erreur est survenue lors de la déconnexion."))
        }
    }
)

export const verifyAccountOtpThunk = createAsyncThunk("auth/verifyAccountOtp",
    async (data: VerifyAccountDTO, { rejectWithValue }) => {
        try {
            return await authApi.verifyOtp(data);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, "Une erreur est survenue lors de la vérification du compte."))
        }
    }
)

export const resendCodeOtpThunk = createAsyncThunk("auth/resendCodeOtp",
    async (data: VerifyAccountDTO, { rejectWithValue }) => {
        try {
            return await authApi.resendCodeOtp(data);
        } catch (error) {
            return rejectWithValue(extractErrorMessage(error, "Une erreur est survenue lors de l'envoi du code OTP."))
        }
    })

let activeRefreshPromise: Promise<unknown> | null = null;

export const refreshTokenThunk = createAsyncThunk("auth/refreshToken",
    async (_, { rejectWithValue }) => {
        try {
            if (activeRefreshPromise) {
                return await activeRefreshPromise;
            }
            
            activeRefreshPromise = authApi.refreshToken();
            const result = await activeRefreshPromise;
            activeRefreshPromise = null;
            return result;
        } catch (error) {
            activeRefreshPromise = null;
            return rejectWithValue(extractErrorMessage(error, "Une erreur est survenue lors du rafraîchissement du token."))
        }
    })
