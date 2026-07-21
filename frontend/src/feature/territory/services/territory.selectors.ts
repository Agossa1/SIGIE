import type { RootState } from "../../../stores/store";
import type { TerritoryGeoJsonLevel } from "./territory.types";

export const selectRegions = (state: RootState) => state.territory?.regions ?? [];
export const selectAllMunicipalities = (state: RootState) => state.territory?.municipalities ?? [];
export const selectMunicipalitiesByRegion = (regionId?: string) => (state: RootState) => 
    regionId ? (state.territory?.municipalitiesByRegion[regionId] ?? []) : [];
export const selectDistrictsByMunicipality = (municipalityId?: string) => (state: RootState) => 
    municipalityId ? (state.territory?.districtsByMunicipality[municipalityId] ?? []) : [];
export const selectNeighborhoodsByDistrict = (districtId?: string) => (state: RootState) => 
    districtId ? (state.territory?.neighborhoodsByDistrict[districtId] ?? []) : [];
export const selectHierarchy = (state: RootState) => state.territory?.hierarchy ?? [];
export const selectUserBoundary = (state: RootState) => state.territory?.userBoundary ?? null;
export const selectTerritoryGeoJson = (level: TerritoryGeoJsonLevel) => (state: RootState) => state.territory?.geoJson[level];
export const selectTerritoryLoading = (state: RootState) => state.territory?.isLoading ?? false;
export const selectTerritoryError = (state: RootState) => state.territory?.error ?? null;
