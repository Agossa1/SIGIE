import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "../../../stores/hooks"
import { 
  fetchRegions, 
  fetchMunicipalities, 
  fetchDistricts, 
  fetchNeighborhoods 
} from "../services/territory.thunk"
import { 
  selectRegions, 
  selectMunicipalitiesByRegion, 
  selectAllMunicipalities,
  selectDistrictsByMunicipality, 
  selectNeighborhoodsByDistrict,
  selectTerritoryLoading,
  selectTerritoryError
} from "../services/territory.selectors"
import type {
  TerritoryFormValues,
} from "../services/territory.types"

/**
 * Chargement léger depuis la DB :
 * - au montage : régions uniquement
 * - à la sélection : communes → arrondissements → quartiers
 */
export function useTerritoryCascade(values: TerritoryFormValues, onChange: (patch: Partial<TerritoryFormValues>, labels?: any) => void) {
  const dispatch = useAppDispatch()
  
  const regions = useAppSelector(selectRegions)
  // If no regionId is selected, we might want all municipalities, or none. The previous code fetched all if no regionId.
  const municipalitiesByRegion = useAppSelector(selectMunicipalitiesByRegion(values.regionId))
  const allMunicipalities = useAppSelector(selectAllMunicipalities)
  const municipalities = values.regionId ? municipalitiesByRegion : allMunicipalities

  const districts = useAppSelector(selectDistrictsByMunicipality(values.municipalityId))
  const neighborhoods = useAppSelector(selectNeighborhoodsByDistrict(values.districtId))

  const isLoading = useAppSelector(selectTerritoryLoading)
  const error = useAppSelector(selectTerritoryError)

  // Restricted Territory Logic
  const currentUser = useAppSelector((state) => (state.auth as any).user)
  const isSuperAdmin = currentUser?.roles?.includes('super_admin')
  const isNationalRole = currentUser?.roles?.includes('platform_admin') || currentUser?.roles?.includes('ministry')
  const isTerritoryRestricted = !isSuperAdmin && !isNationalRole && !!currentUser?.municipalityId

  // Auto-fill territory if restricted
  useEffect(() => {
    if (isTerritoryRestricted && regions.length > 0 && currentUser?.regionId && !values.regionId) {
      const region = regions.find(r => r.id === currentUser.regionId)
      if (region) {
        onChange({ regionId: region.id }, { regionName: region.name })
      }
    }
  }, [isTerritoryRestricted, regions, currentUser?.regionId, values.regionId, onChange])

  useEffect(() => {
    if (isTerritoryRestricted && municipalities.length > 0 && currentUser?.municipalityId && !values.municipalityId) {
      const commune = municipalities.find(m => m.id === currentUser.municipalityId)
      if (commune) {
        onChange({ municipalityId: commune.id }, { municipalityName: commune.name })
      }
    }
  }, [isTerritoryRestricted, municipalities, currentUser?.municipalityId, values.municipalityId, onChange])

  // 1. Régions
  useEffect(() => {
    if (regions.length === 0) {
      dispatch(fetchRegions())
    }
  }, [dispatch, regions.length])

  // 2. Communes selon la région
  useEffect(() => {
    if (values.regionId && municipalitiesByRegion.length === 0) {
      dispatch(fetchMunicipalities(values.regionId))
    } else if (!values.regionId && allMunicipalities.length === 0) {
      dispatch(fetchMunicipalities())
    }
  }, [dispatch, values.regionId, municipalitiesByRegion.length, allMunicipalities.length])

  // 3. Arrondissements selon la commune
  useEffect(() => {
    if (values.municipalityId && districts.length === 0) {
      dispatch(fetchDistricts(values.municipalityId))
    }
  }, [dispatch, values.municipalityId, districts.length])

  // 4. Quartiers selon l'arrondissement
  useEffect(() => {
    if (values.districtId && neighborhoods.length === 0) {
      dispatch(fetchNeighborhoods(values.districtId))
    }
  }, [dispatch, values.districtId, neighborhoods.length])

  return {
    regions,
    municipalities,
    districts,
    neighborhoods,
    isLoading,
    isLoadingMunicipalities: isLoading,
    isLoadingDistricts: isLoading,
    isLoadingNeighborhoods: isLoading,
    error,
  }
}
