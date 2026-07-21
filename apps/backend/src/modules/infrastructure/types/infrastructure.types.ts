export interface InfrastructureItem {
    id: string;
    name: string;
    infrastructureType: string;
    description?: string;
    municipalityId?: string;
    conditionStatus: string;
    latitude?: number;
    longitude?: number;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateInfrastructureDTO {
    name: string;
    infrastructureType: string;
    description?: string;
    municipalityId?: string;
    conditionStatus?: string;
    latitude?: number;
    longitude?: number;
}

export interface UpdateInfrastructureDTO {
    name?: string;
    description?: string;
    conditionStatus?: string;
    latitude?: number;
    longitude?: number;
}

export interface InfrastructureFilters {
    type?: string;
    municipalityId?: string;
    status?: string;
    page?: number;
    limit?: number;
}

export interface PaginatedInfrastructureResponse {
    data: InfrastructureItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}