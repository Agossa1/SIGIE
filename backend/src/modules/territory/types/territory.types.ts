export interface Region {
    id: string;
    code: string;
    name: string;
}

export interface Municipality {
    id: string;
    code: string;
    name: string;
    regionId: string;
}

export interface District {
    id: string;
    code: string;
    name: string;
    municipalityId: string;
}

export interface Neighborhood {
    id: string;
    code: string;
    name: string;
    districtId: string;
}