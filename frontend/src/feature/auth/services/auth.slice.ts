import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { type AuthState, type User } from "./auth.types";
import {
    loginThunk,
    logoutThunk,
    refreshTokenThunk,
    verifyAccountOtpThunk,
    registerThunk,
    resendCodeOtpThunk,
} from "./auth.thunk";

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setAuthenticated: (state, action: any) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
        },
        updateUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Register ---
            .addCase(registerThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerThunk.fulfilled, (state) => {
                state.isLoading = false;
                // Reste non authentifié jusqu'à la vérification OTP
            })
            .addCase(registerThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // --- Login ---
            .addCase(loginThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload ?? null;
                state.isAuthenticated = true;
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            })

            // --- Verify OTP ---
            .addCase(verifyAccountOtpThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyAccountOtpThunk.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(verifyAccountOtpThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // --- Logout ---
            .addCase(logoutThunk.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutThunk.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(logoutThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })

            // --- Refresh Token ---
            .addCase(refreshTokenThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(refreshTokenThunk.fulfilled, (state, action: any) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                if (action.payload?.user) {
                    state.user = action.payload.user;
                }
            })
            .addCase(refreshTokenThunk.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
                state.isAuthenticated = false;
            })

            // --- Resend OTP ---
            .addCase(resendCodeOtpThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(resendCodeOtpThunk.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(resendCodeOtpThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
    }
})

export const { clearError, setAuthenticated, updateUser } = authSlice.actions;
export default authSlice.reducer;