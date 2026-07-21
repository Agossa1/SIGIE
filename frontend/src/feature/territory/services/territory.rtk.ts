import { baseApi } from "../../../stores/baseApi";
import type {
  GeoJsonFeatureCollection,
  TerritoryDistrict,
  TerritoryGeoJsonLevel,
  TerritoryMunicipality,
  TerritoryNeighborhood,
  TerritoryRegion,
  TerritoryRegionNode,
} from "./territory.types";
import type { TerritoryGeoJsonOptions, TerritoryReverseGeocode } from "./territory.api";

export const territoryRtkApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRegions: builder.query<TerritoryRegion[], void>({
      query: () => "/territory/regions",
      transformResponse: (response: { data: TerritoryRegion[] }) => response.data,
      providesTags: ['Territory'],
    }),

    getHierarchy: builder.query<TerritoryRegionNode[], void>({
      query: () => "/territory/hierarchy",
      transformResponse: (response: { data: TerritoryRegionNode[] }) => response.data,
      providesTags: ['Territory'],
    }),

    getMunicipalities: builder.query<TerritoryMunicipality[], string | void>({
      query: (regionId) => regionId 
        ? `/territory/municipalities?regionId=${encodeURIComponent(regionId)}`
        : "/territory/municipalities",
      transformResponse: (response: { data: TerritoryMunicipality[] }) => response.data,
      providesTags: ['Territory'],
    }),

    getDistricts: builder.query<TerritoryDistrict[], string>({
      query: (municipalityId) => `/territory/districts?municipalityId=${encodeURIComponent(municipalityId)}`,
      transformResponse: (response: { data: TerritoryDistrict[] }) => response.data,
      providesTags: ['Territory'],
    }),

    getNeighborhoods: builder.query<TerritoryNeighborhood[], string>({
      query: (districtId) => `/territory/neighborhoods?districtId=${encodeURIComponent(districtId)}`,
      transformResponse: (response: { data: TerritoryNeighborhood[] }) => response.data,
      providesTags: ['Territory'],
    }),

    reverseGeocode: builder.query<TerritoryReverseGeocode | null, { lat: number; lng: number }>({
      query: ({ lat, lng }) => `/territory/reverse-geocode?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`,
      transformResponse: (response: { data: TerritoryReverseGeocode | null }) => response.data,
    }),

    getGeoJson: builder.query<GeoJsonFeatureCollection, { level: TerritoryGeoJsonLevel; options?: TerritoryGeoJsonOptions }>({
      query: ({ level, options = {} }) => {
        const params = new URLSearchParams();
        if (options.tolerance !== undefined) params.set('tolerance', String(options.tolerance));
        if (options.regionId) params.set('regionId', options.regionId);
        if (options.municipalityId) params.set('municipalityId', options.municipalityId);
        if (options.districtId) params.set('districtId', options.districtId);
        const qs = params.toString();
        return `/territory/geojson/${level}${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (response: { data: GeoJsonFeatureCollection }) => response.data,
      providesTags: (_result, _error, { level }) => [{ type: 'Territory', id: level }],
    }),
  }),
});

export const {
  useGetRegionsQuery,
  useGetHierarchyQuery,
  useGetMunicipalitiesQuery,
  useGetDistrictsQuery,
  useGetNeighborhoodsQuery,
  useReverseGeocodeQuery,
  useGetGeoJsonQuery,
  useLazyGetGeoJsonQuery,
} = territoryRtkApi;
