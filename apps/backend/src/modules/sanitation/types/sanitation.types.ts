export interface WastePoint {
    id: string;
    name: string;
    municipalityId?: string;
    latitude?: number;
    longitude?: number;
    wasteType?: string;
    createdAt: string;
}

export interface WasteCollection {
    id: string;
    municipalityId?: string;
    collectionDate: string;
    volumeCollected?: number;
    teamId?: string;
    status?: string;
}

export interface SanitationCampaign {
    id: string;
    municipalityId?: string;
    name: string;
    startDate: string;
    endDate?: string;
    createdAt: string;
}