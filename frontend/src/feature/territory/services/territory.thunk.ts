import { createAsyncThunk } from "@reduxjs/toolkit";
import { territoryApi } from "./territory.api";
import type { TerritoryScope } from "./territoryScope";
import type {
    TerritoryRegion,
    TerritoryMunicipality,
    TerritoryDistrict,
    TerritoryNeighborhood,
    TerritoryRegionNode,
    TerritoryGeoJsonLevel,
    GeoJsonFeatureCollection,
} from "./territory.types";

export const fetchRegions = createAsyncThunk<TerritoryRegion[], void, { rejectValue: string }>(
    "territory/fetchRegions",
    async (_, { rejectWithValue }) => {
        try {
            const response = await territoryApi.getRegions();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Erreur lors du chargement des régions");
        }
    }
);

export const fetchMunicipalities = createAsyncThunk<
    { regionId?: string; data: TerritoryMunicipality[] },
    string | undefined,
    { rejectValue: string }
>(
    "territory/fetchMunicipalities",
    async (regionId, { rejectWithValue }) => {
        try {
            const response = regionId
                ? await territoryApi.getMunicipalitiesByRegion(regionId)
                : await territoryApi.getMunicipalities();
            return { regionId, data: response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Erreur lors du chargement des communes");
        }
    }
);

export const fetchDistricts = createAsyncThunk<
    { municipalityId: string; data: TerritoryDistrict[] },
    string,
    { rejectValue: string }
>(
    "territory/fetchDistricts",
    async (municipalityId, { rejectWithValue }) => {
        try {
            const response = await territoryApi.getDistrictsByMunicipality(municipalityId);
            return { municipalityId, data: response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Erreur lors du chargement des arrondissements");
        }
    }
);

export const fetchNeighborhoods = createAsyncThunk<
    { districtId: string; data: TerritoryNeighborhood[] },
    string,
    { rejectValue: string }
>(
    "territory/fetchNeighborhoods",
    async (districtId, { rejectWithValue }) => {
        try {
            const response = await territoryApi.getNeighborhoodsByDistrict(districtId);
            return { districtId, data: response.data };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Erreur lors du chargement des quartiers");
        }
    }
);

export const fetchHierarchy = createAsyncThunk<TerritoryRegionNode[], void, { rejectValue: string }>(
    "territory/fetchHierarchy",
    async (_, { rejectWithValue }) => {
        try {
            const response = await territoryApi.getHierarchy();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Erreur lors du chargement de la hiérarchie");
        }
    }
);

export const fetchUserBoundary = createAsyncThunk<
    { type: string; name: string; municipalityName?: string; boundary?: any },
    void,
    { rejectValue: string }
>(
    "territory/fetchUserBoundary",
    async (_, { rejectWithValue }) => {
        try {
            const { api } = await import("../../../lib/apiClient");
            const response = await api.get<{ data: { type: string; name: string; municipalityName?: string; boundary?: any } }>("/territory/user-boundary");
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Erreur lors du chargement de votre périmètre");
        }
    }
);

// GeoJSON Thunks

export const fetchBaseGeoJson = createAsyncThunk<
    Partial<Record<TerritoryGeoJsonLevel, GeoJsonFeatureCollection>>,
    { layers: TerritoryGeoJsonLevel[]; scope: TerritoryScope },
    { rejectValue: string }
>(
    "territory/fetchBaseGeoJson",
    async ({ layers, scope }, { rejectWithValue }) => {
        try {
            return await territoryApi.getScopedBaseTerritoryGeoJson(layers, scope);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Erreur lors du chargement des géo-données de base");
        }
    }
);

export const fetchDetailGeoJson = createAsyncThunk<
    Partial<Record<TerritoryGeoJsonLevel, GeoJsonFeatureCollection>>,
    { layers: TerritoryGeoJsonLevel[]; scope: TerritoryScope },
    { rejectValue: string }
>(
    "territory/fetchDetailGeoJson",
    async ({ layers, scope }, { rejectWithValue }) => {
        try {
            return await territoryApi.getScopedDetailTerritoryGeoJson(layers, scope);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Erreur lors du chargement des géo-données détaillées");
        }
    }
);
