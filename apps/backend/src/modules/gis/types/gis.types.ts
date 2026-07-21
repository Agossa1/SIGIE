export interface GisLayer {
    id: string;
    municipalityId?: string;
    name: string;
    layerType: string;
    description?: string;
    featureCount?: number;
    createdBy?: string;
    createdAt: string;
}

export interface GisFeature {
    id: string;
    layerId: string;
    featureType?: string;
    title?: string;
    description?: string;
    severityLevel?: string;
    geometry: any;
    properties?: Record<string, any>;
    createdAt: string;
}

export interface CreateGisLayerDTO {
    municipalityId?: string;
    name: string;
    layerType: string;
    description?: string;
    createdBy?: string;
    geojson: GeoJsonFeatureCollection;
}

export interface UpdateGisLayerDTO {
    layerId: string;
    name?: string;
    layerType?: string;
    description?: string;
    municipalityId?: string;
    createdBy?: string;
    geojson: GeoJsonFeatureCollection;
}

export interface DeleteGisLayerDTO {
    layerId: string;
}

export interface GeoJsonFeature {
    type: 'Feature';
    geometry: any;
    properties?: Record<string, any> | null;
}

export interface GeoJsonFeatureCollection {
    type: 'FeatureCollection';
    features: GeoJsonFeature[];
}
