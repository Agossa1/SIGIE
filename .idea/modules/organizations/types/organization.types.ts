export enum OrganizationType {
    SGDS = 'sgds',
    DST = 'dst',
    MUNICIPALITY = 'municipality',
    MINISTRY = 'ministry',
    PREFECTURE = 'prefecture',
    PRIVATE_CONTRACTOR = 'private_contractor'
}

export interface Organization {
    id: string;
    code?: string;
    name: string;
    organizationType?: OrganizationType;
    email?: string;
    phone?: string;
    address?: string;
    createdAt: string;
}

export interface CreateOrganizationDTO {
    code?: string;
    name: string;
    organizationType?: OrganizationType;
    email?: string;
    phone?: string;
    address?: string;
}

export interface UpdateOrganizationDTO {
    code?: string;
    name?: string;
    organizationType?: OrganizationType;
    email?: string;
    phone?: string;
    address?: string;
}