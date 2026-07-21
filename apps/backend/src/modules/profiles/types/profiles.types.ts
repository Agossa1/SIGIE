export interface UserProfile {
    id: string;
    userId: string;
    language?: string;
    theme?: string;
    notifications?: boolean;
    photoUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileDTO {
    language?: string;
    theme?: string;
    notifications?: boolean;
    photoUrl?: string;
}