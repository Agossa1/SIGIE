export interface GeoJsonFeatureCollection {
    type: 'FeatureCollection';
    features: GeoJsonFeature[];
}

export interface GeoJsonFeature {
    type: 'Feature';
    id?: string;
    geometry: Record<string, unknown> | null;
    properties?: Record<string, any> | null;
}

export type TerritoryGeoJsonLevel = 'regions' | 'municipalities' | 'districts' | 'neighborhoods';

export interface Region {
    id: string;
    code: string | null;
    name: string;
}

export interface Department {
    id: string;
    code: string;
    name: string;
    geometry?: any;
    createdAt: Date;
}

export interface Municipality {
    id: string;
    organizationId?: string | null;
    code: string | null;
    name: string;
    regionId?: string | null;
    departmentId?: string;
    department?: string;
    geometry?: any;
    createdAt?: Date;
}

export interface District {
    id: string;
    municipalityId: string;
    name: string;
    code: string;
    geometry?: any;
    createdAt: Date;
}

export interface Neighborhood {
    id: string;
    districtId: string;
    name: string;
    code: string;
    geometry?: any;
    createdAt: Date;
}

export interface CreateNeighborhoodDTO {
    name: string;
    code: string;
    geometry?: any;
}

export interface CreateDistrictDTO {
    name: string;
    code: string;
    geometry?: any;
    neighborhoods?: CreateNeighborhoodDTO[];
}

export interface CreateMunicipalityDTO {
    organizationId: string;
    code: string;
    name: string;
    department?: string;
    geometry?: any;
    districts?: CreateDistrictDTO[];
}


export interface UpdateMunicipalityDTO {
    name?: string;
    code?: string;
    department?: string;
    regionId?: string;
    geometry?: any;
}