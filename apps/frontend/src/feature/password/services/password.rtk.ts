import { baseApi } from "../../../stores/baseApi";
import type {
    ForgotPasswordPayload,
    VerifyPasswordCodePayload,
    ResetPasswordPayload,
    ChangePasswordPayload,
    PasswordResponse,
} from "./password.types";

/**
 * RTK Query — Endpoints pour le module Password.
 * Remplace password.api.ts + password.thunk.ts + password.slice.ts + password.selectors.ts.
 */
export const passwordRtkApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        forgotPassword: builder.mutation<PasswordResponse, ForgotPasswordPayload>({
            query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
        }),
        verifyCodePasswordOTP: builder.mutation<PasswordResponse, VerifyPasswordCodePayload>({
            query: (body) => ({ url: "/auth/verify-code-password", method: "POST", body }),
        }),
        resetPassword: builder.mutation<PasswordResponse, ResetPasswordPayload>({
            query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
        }),
        changePassword: builder.mutation<PasswordResponse, ChangePasswordPayload>({
            query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
        }),
    }),
});

export const {
    useForgotPasswordMutation,
    useVerifyCodePasswordOTPMutation,
    useResetPasswordMutation,
    useChangePasswordMutation,
} = passwordRtkApi;