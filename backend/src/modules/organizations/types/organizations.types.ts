export interface Organization {
    id: string;
    name: string;
    type: string;
    municipalityId?: string;
    regionId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrganizationDTO {
    name: string;
    type: string;
    municipalityId?: string;
    regionId?: string;
}

export interface UpdateOrganizationDTO {
    name?: string;
    type?: string;
}