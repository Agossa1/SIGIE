import { createSlice } from "@reduxjs/toolkit";
import type {
    TerritoryRegion,
    TerritoryMunicipality,
    TerritoryDistrict,
    TerritoryNeighborhood,
    TerritoryRegionNode,
    TerritoryGeoJsonLevel,
    GeoJsonFeatureCollection,
} from "./territory.types";
import {
    fetchRegions,
    fetchMunicipalities,
    fetchDistricts,
    fetchNeighborhoods,
    fetchHierarchy,
    fetchUserBoundary,
    fetchBaseGeoJson,
    fetchDetailGeoJson,
} from "./territory.thunk";

export interface TerritoryState {
    regions: TerritoryRegion[];
    municipalities: TerritoryMunicipality[]; // Flat list, or cached
    municipalitiesByRegion: Record<string, TerritoryMunicipality[]>;
    districtsByMunicipality: Record<string, TerritoryDistrict[]>;
    neighborhoodsByDistrict: Record<string, TerritoryNeighborhood[]>;
    hierarchy: TerritoryRegionNode[];
    userBoundary: { type: string; name: string; municipalityName?: string; boundary?: any } | null;
    geoJson: Partial<Record<TerritoryGeoJsonLevel, GeoJsonFeatureCollection>>;
    isLoading: boolean;
    error: string | null;
}

const initialState: TerritoryState = {
    regions: [],
    municipalities: [],
    municipalitiesByRegion: {},
    districtsByMunicipality: {},
    neighborhoodsByDistrict: {},
    hierarchy: [],
    userBoundary: null,
    geoJson: {},
    isLoading: false,
    error: null,
};

const territorySlice = createSlice({
    name: "territory",
    initialState,
    reducers: {
        clearTerritoryError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Regions
            .addCase(fetchRegions.pending, (state) => { state.isLoading = true; })
            .addCase(fetchRegions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.regions = action.payload;
            })
            .addCase(fetchRegions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Municipalities
            .addCase(fetchMunicipalities.pending, (state) => { state.isLoading = true; })
            .addCase(fetchMunicipalities.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.regionId) {
                    state.municipalitiesByRegion[action.payload.regionId] = action.payload.data;
                } else {
                    state.municipalities = action.payload.data;
                }
            })
            .addCase(fetchMunicipalities.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Districts
            .addCase(fetchDistricts.pending, (state) => { state.isLoading = true; })
            .addCase(fetchDistricts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.districtsByMunicipality[action.payload.municipalityId] = action.payload.data;
            })
            .addCase(fetchDistricts.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Neighborhoods
            .addCase(fetchNeighborhoods.pending, (state) => { state.isLoading = true; })
            .addCase(fetchNeighborhoods.fulfilled, (state, action) => {
                state.isLoading = false;
                state.neighborhoodsByDistrict[action.payload.districtId] = action.payload.data;
            })
            .addCase(fetchNeighborhoods.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Hierarchy
            .addCase(fetchHierarchy.fulfilled, (state, action) => {
                state.hierarchy = action.payload;
            })
            // User Boundary
            .addCase(fetchUserBoundary.fulfilled, (state, action) => {
                state.userBoundary = action.payload;
            })
            // GeoJson
            .addCase(fetchBaseGeoJson.fulfilled, (state, action) => {
                state.geoJson = { ...state.geoJson, ...action.payload };
            })
            .addCase(fetchDetailGeoJson.fulfilled, (state, action) => {
                state.geoJson = { ...state.geoJson, ...action.payload };
            });
    }
});

export const { clearTerritoryError } = territorySlice.actions;
export const territoryReducer = territorySlice.reducer;
