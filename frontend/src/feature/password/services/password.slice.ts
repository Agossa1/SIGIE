import { createSlice } from "@reduxjs/toolkit"
import { forgotPasswordThunk, resetPasswordThunk, changePasswordThunk, verifyCodePasswordOTPThunk } from "./password.thunk"

interface PasswordState {
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: PasswordState = {
    isLoading: false,
    error: null,
    successMessage: null,
}

const passwordSlice = createSlice({
    name: "password",
    initialState,
    reducers: {
        clearPasswordState: (state) => {
            state.error = null;
            state.successMessage = null;
            state.isLoading = false;
        }
    },
    extraReducers: (builder) => {
        // Forgot Password
        builder.addCase(forgotPasswordThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.successMessage = null;
        })
        builder.addCase(forgotPasswordThunk.fulfilled, (state, action) => {
            state.isLoading = false;
            // 🛡️ Sécurisation : utilise le message de l'objet, le payload brut, ou un message par défaut
            state.successMessage = action.payload?.message || (typeof action.payload === 'string' ? action.payload : "Demande envoyée avec succès");
        })
        builder.addCase(forgotPasswordThunk.rejected, (state, action) => {
            state.isLoading = false;
            // 🛡️ Sécurisation : récupère l'erreur du payload ou l'erreur native Redux
            state.error = (action.payload as string) || action.error.message || "Une erreur est survenue";
        })

        // Reset Password
        builder.addCase(resetPasswordThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.successMessage = null;
        })
        builder.addCase(resetPasswordThunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.successMessage = action.payload?.message || (typeof action.payload === 'string' ? action.payload : "Mot de passe réinitialisé avec succès");
        })
        builder.addCase(resetPasswordThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = (action.payload as string) || action.error.message || "Une erreur est survenue";
        })

        // Change Password
        builder.addCase(changePasswordThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.successMessage = null;
        })
        builder.addCase(changePasswordThunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.successMessage = action.payload?.message || (typeof action.payload === 'string' ? action.payload : "Mot de passe modifié avec succès");
        })
        builder.addCase(changePasswordThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = (action.payload as string) || action.error.message || "Une erreur est survenue";
        })

        // Verify OTP Code
        builder.addCase(verifyCodePasswordOTPThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
            state.successMessage = null;
        })
        builder.addCase(verifyCodePasswordOTPThunk.fulfilled, (state) => {
            state.isLoading = false;
            state.successMessage = "Code vérifié avec succès.";
        })
        builder.addCase(verifyCodePasswordOTPThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = (action.payload as string) || action.error.message || "Code OTP invalide ou expiré.";
        })
    }
})

export const { clearPasswordState } = passwordSlice.actions
export default passwordSlice.reducer
