export enum Role {
    SUPER_ADMIN = 'super_admin',
    PLATFORM_ADMIN = 'platform_admin',
    MINISTRY = 'ministry',
    PREFECTURE_DIRECTOR = 'prefecture_director',
    MAYOR = 'mayor',
    DST_MANAGER = 'dst_manager',
    SGDS_MANAGER = 'sgds_manager',
    SUPERVISOR = 'supervisor',
    TEAM_LEADER = 'team_leader',
    TECHNICIAN = 'technician',
    VIEWER = 'viewer',
}

export enum UserStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    DISABLED = 'disabled',
}

export enum AccountType {
    USER = 'user',
    ADMIN = 'admin',
    ORGANIZATION = 'organization',
    MUNICIPALITY = 'municipality',
    DISTRICT = 'district',
    NEIGHBORHOOD = 'neighborhood',
    FIELD_AGENT = 'field_agent',
    TECHNICIAN = 'technician',
    PARTNER = 'partner',
    SUPPLIER = 'supplier',
    CITIZEN = 'citizen',
}

export interface UserPreferences {
    photoUrl?: string;
    language: string;
    theme: string;
    fcmToken?: string;
    notificationsEnabled: boolean;
    lastLoginAt?: Date;
}

export interface User {
    id: string;
    organizationId?: string;
    regionId?: string;
    municipalityId?: string;
    districtId?: string;
    neighborhoodId?: string;
    department?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    type: AccountType;
    status: UserStatus;
    createdBy?: string;
    preferences?: UserPreferences;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

export interface Credentials {
    id: string;
    userId: string;
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserSession {
    id: string;
    userId: string;
    token: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
    createdAt: Date;
}

export interface UserOTP {
    id: string;
    userId: string;
    codeHash: string;
    otpType: 'account_activation' | 'password_reset' | 'email_change';
    expiresAt: Date;
    verified: boolean;
    verifiedAt?: Date;
    createdAt: Date;
}

export interface AuthUser extends User {
    credentials?: Credentials;
    roles: Role[];
    sessions?: UserSession[];
    otps?: UserOTP[];
}

/**
 * Réponses standardisées pour l'authentification
 */
export interface LoginResponse {
    user: Omit<AuthUser, 'credentials'>;
    accessToken: string;
    refreshToken: string;
}

/**
 * DTOs pour les opérations d'authentification
 */
export interface UpdateUserDTO {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    status?: UserStatus;
}

export interface TokenPayload {
    id: string;
    email: string;
    roles: Role[];
    organizationId?: string;
    regionId?: string;
    municipalityId?: string;
    districtId?: string;
    neighborhoodId?: string;
    department?: string;
}
