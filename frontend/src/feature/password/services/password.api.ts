import { api } from "../../../lib/apiClient"
import type { ForgotPasswordPayload, ResetPasswordPayload, ChangePasswordPayload, VerifyPasswordCodePayload, PasswordResponse } from "./password.types"

export const passwordApi = {
    forgotPassword: async (data: ForgotPasswordPayload): Promise<PasswordResponse> => {
        try {
            const response = await api.post<PasswordResponse>("/password/forgot-password", data)
            return response
        } catch (error) {
            throw error
        }
    },

    resetPassword: async (data: ResetPasswordPayload): Promise<PasswordResponse> => {
        try {
            const response = await api.post<PasswordResponse>("/password/reset-password", data)
            return response
        } catch (error) {
            throw error
        }
    },

    changePassword: async (data: ChangePasswordPayload): Promise<PasswordResponse> => {
        try {
            const response = await api.post<PasswordResponse>("/password/change-password", data)
            return response
        } catch (error) {
            throw error
        }
    },

    verifyPasswordCode: async (data: VerifyPasswordCodePayload): Promise<PasswordResponse> => {
        try {
            const response = await api.post<PasswordResponse>("/password/verify-code", data)
            return response
        } catch (error) {
            throw error
        }
    }
}
