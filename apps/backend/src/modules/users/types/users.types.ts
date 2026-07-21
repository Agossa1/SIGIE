export enum UserStatus {
    PENDING = 'pending',
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    DISABLED = 'disabled',
}

export interface User {
    id: string;
    organizationId?: string;
    regionId?: string;
    municipalityId?: string;
    districtId?: string;
    neighborhoodId?: string;
    roles: string[];
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

export interface CreateUserDTO {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password?: string;
    role?: string;
    organizationId?: string;
    municipalityId?: string;
    regionId?: string;
    districtId?: string;
    neighborhoodId?: string;
}

export interface UpdateUserDTO {
    organizationId?: string;
    municipalityId?: string;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    roles?: string[];
    status?: UserStatus;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}