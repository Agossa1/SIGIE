import { createAsyncThunk } from "@reduxjs/toolkit"
import { passwordApi } from "./password.api"
import type { ForgotPasswordPayload, ResetPasswordPayload, ChangePasswordPayload, VerifyPasswordCodePayload } from "./password.types"


export const forgotPasswordThunk = createAsyncThunk(
    "password/forgot",
    async (payload: ForgotPasswordPayload, { rejectWithValue }) => {
        try {
            const response = await passwordApi.forgotPassword(payload)
            return response
        } catch (error: any) {
            return rejectWithValue(error.message || "Une erreur est survenue lors de la demande.")
        }
    }
)

export const resetPasswordThunk = createAsyncThunk(
    "password/reset",
    async (payload: ResetPasswordPayload, { rejectWithValue }) => {
        try {
            const response = await passwordApi.resetPassword(payload)
            return response
        } catch (error: any) {
            return rejectWithValue(error.message || "Erreur lors de la réinitialisation.")
        }
    }
)

export const changePasswordThunk = createAsyncThunk(
    "password/change",
    async (payload: ChangePasswordPayload, { rejectWithValue }) => {
        try {
            const response = await passwordApi.changePassword(payload)
            return response
        } catch (error: any) {
            return rejectWithValue(error.message || "Erreur lors du changement de mot de passe.")
        }
    }

)


export const verifyCodePasswordOTPThunk = createAsyncThunk(
    "password/verifyCode",
    async (payload: VerifyPasswordCodePayload, { rejectWithValue }) => {
        try {
            const response = await passwordApi.verifyPasswordCode(payload)
            return response
        } catch (error: any) {
            return rejectWithValue(error.message || "Erreur lors de la vérification du code.")
        }
    }
)
