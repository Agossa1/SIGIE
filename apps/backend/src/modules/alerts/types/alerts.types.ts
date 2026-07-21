export interface Alert {
    id: string;
    title: string;
    description?: string;
    alertType: string;
    severity: string;
    municipalityId?: string;
    regionId?: string;
    validUntil?: string;
    createdBy?: string;
    acknowledgedBy?: string;
    acknowledgedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAlertDTO {
    title: string;
    description?: string;
    alertType: string;
    severity?: string;
    municipalityId?: string;
    regionId?: string;
    validUntil?: string;
}

export interface AlertFilters {
    type?: string;
    severity?: string;
    municipalityId?: string;
    page?: number;
    limit?: number;
}