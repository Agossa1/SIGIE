import { api } from "../../../lib/apiClient"
import type { CreateUserDTO, User, LoginCredentials, VerifyAccountDTO } from "./auth.types"

export const authApi = {

    register: async (data: CreateUserDTO): Promise<User> => {
        const response = await api.post<{ success: boolean; data: { user: User } }>("/auth/register", data)
        return response.data.user
    },

    login: async (data: LoginCredentials): Promise<User> => {
        const response = await api.post<{ success: boolean; data: { user: User } }>("/auth/login", {
            identifier: data.email,
            password: data.password
        })
        return response.data.user
    },

    verifyOtp: async (data: VerifyAccountDTO) => {
        return api.post<{ success: boolean; message: string }>("/auth/verify", data)
    },

    logout: async () => {
        return api.post<{ success: boolean; message: string }>("/auth/logout", {})
    },

    refreshToken: async (): Promise<{ user: User }> => {
        const response = await api.post<{ success: boolean; data: { user: User } }>("/auth/refresh-token", {})
        return response.data
    },

    resendCodeOtp: async (data: VerifyAccountDTO) => {
        return api.post<{ success: boolean; message: string }>("/auth/resend-code-otp", data)
    }
}
