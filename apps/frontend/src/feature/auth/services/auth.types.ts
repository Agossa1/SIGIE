export enum User_Role {
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

export interface User {
    id: string;
    organizationId?: string;
    regionId?: string;
    municipalityId?: string;
    districtId?: string;
    neighborhoodId?: string;
    department?: string;
    roles: User_Role[];
    type?: AccountType;
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    status: UserStatus;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}


export interface CreateUserDTO {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password?: string;
    role?: User_Role;
    organizationId?: string;
    municipalityId?: string;
    regionId?: string;
    districtId?: string;
    neighborhoodId?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface UpdateUserDTO {
    id?: string;
    organizationId?: string;
    municipalityId?: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    roles?: User_Role[];
    status?: UserStatus;
}


export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface VerifyAccountDTO {
    email: string;
    code: string;
}

export interface ResendVerificationCodeDTO {
    email: string;
}
