export interface ForgotPasswordPayload {
    email: string;
}

export interface VerifyPasswordCodePayload {
    email: string;
    otp: string;
}

export interface ResetPasswordPayload {
    email: string;
    otp: string;
    newPassword: string;
}

export interface ChangePasswordPayload {
    oldPassword: string;
    newPassword: string;
}

export interface PasswordResponse {
    success: boolean;
    message: string;
}
