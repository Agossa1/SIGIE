import { baseApi } from "../../../stores/baseApi";

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

export const gisRtkApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLayers: builder.query<GisLayer[], void>({
      query: () => "/gis",
      transformResponse: (response: { success: boolean; data: GisLayer[] }) => response.data,
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Gis' as const, id })), { type: 'Gis', id: 'LIST' }]
          : [{ type: 'Gis', id: 'LIST' }],
    }),

    getLayerGeoJson: builder.query<GeoJSON.FeatureCollection, string>({
      query: (id) => `/gis/${id}/geojson`,
      transformResponse: (response: { success: boolean; data: GeoJSON.FeatureCollection }) => response.data,
    }),

    uploadLayer: builder.mutation<{ layerId: string; featureCount: number }, FormData>({
      query: (formData) => ({
        url: "/gis",
        method: "POST",
        body: formData,
      }),
      transformResponse: (response: { success: boolean; data: { layerId: string; featureCount: number } }) => response.data,
      invalidatesTags: [{ type: 'Gis', id: 'LIST' }],
    }),

    deleteLayer: builder.mutation<void, string>({
      query: (id) => ({
        url: `/gis/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: 'Gis', id: 'LIST' }],
    }),

    getNatureGeoJson: builder.query<GeoJSON.FeatureCollection, { type: string; municipalityId?: string }>({
      query: ({ type, municipalityId }) => {
        const url = municipalityId
          ? `/nature/geojson/${type}?municipalityId=${municipalityId}`
          : `/nature/geojson/${type}`;
        return url;
      },
      transformResponse: (response: { success: boolean; data: GeoJSON.FeatureCollection }) => response.data,
    }),
  }),
});

export const {
  useGetLayersQuery,
  useGetLayerGeoJsonQuery,
  useUploadLayerMutation,
  useDeleteLayerMutation,
  useGetNatureGeoJsonQuery,
} = gisRtkApi;
