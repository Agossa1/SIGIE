import React from "react";
import { useAppSelector } from "../../../stores/hooks";
import { useTerritoryCascade } from "../../territory/hooks/useTerritoryCascade";
import type {
  TerritoryFormLabels,
  TerritoryFormValues,
} from "../../territory/services/territory.types";

interface TerritoryCascadeFieldsProps {
  values: TerritoryFormValues;
  onChange: (patch: Partial<TerritoryFormValues>, labels?: Partial<TerritoryFormLabels>) => void;
  isNeighborhoodRequired?: boolean;
}

const SELECT_CLASS =
  "w-full border border-gray-200 bg-white px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none rounded";

const TerritoryCascadeFields = ({
  values,
  onChange,
  isNeighborhoodRequired = true,
}: TerritoryCascadeFieldsProps) => {
  const { regions, municipalities, districts, neighborhoods } = useTerritoryCascade(values, onChange);

  const currentUser = useAppSelector((state) => (state.auth as any).user);
  const isSuperAdmin = currentUser?.roles?.includes('super_admin');
  const isNationalRole = currentUser?.roles?.includes('platform_admin') || currentUser?.roles?.includes('ministry');
  const isTerritoryRestricted = !isSuperAdmin && !isNationalRole && !!currentUser?.municipalityId;

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    const region = regions.find((r) => r.id === regionId);
    onChange(
      { regionId, municipalityId: "", districtId: "", neighborhoodId: "" },
      { regionName: region?.name ?? "" }
    );
  };

  const handleMunicipalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const municipalityId = e.target.value;
    const municipality = municipalities.find((m) => m.id === municipalityId);
    onChange(
      { municipalityId, districtId: "", neighborhoodId: "" },
      { municipalityName: municipality?.name ?? "" }
    );
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    const district = districts.find((d) => d.id === districtId);
    onChange(
      { districtId, neighborhoodId: "" },
      { districtName: district?.name ?? "" }
    );
  };

  const handleNeighborhoodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const neighborhoodId = e.target.value;
    const neighborhood = neighborhoods.find((n) => n.id === neighborhoodId);
    onChange({ neighborhoodId }, { neighborhoodName: neighborhood?.name ?? "" });
  };

  return (
    <div className="space-y-3">
      <span className="text-sm font-medium text-gray-700 block">
        Localisation Administrative
      </span>

      {/* Région */}
      <label className="block">
        <span className="text-sm font-semibold text-gray-500 mb-1 block">Région <span className="text-rose-500">*</span></span>
        <select 
          value={values.regionId || ""} 
          onChange={handleRegionChange} 
          required 
          disabled={isTerritoryRestricted}
          className={SELECT_CLASS}
        >
          <option value="">— Sélectionner une région —</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </label>

      {/* Commune */}
      <label className="block">
        <span className="text-sm font-semibold text-gray-500 mb-1 block">Commune <span className="text-rose-500">*</span></span>
        <select
          value={values.municipalityId || ""}
          onChange={handleMunicipalityChange}
          disabled={isTerritoryRestricted || !values.regionId}
          required
          className={SELECT_CLASS}
        >
          <option value="">— Sélectionner une commune —</option>
          {municipalities.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </label>

      {/* Arrondissement */}
      <label className="block">
        <span className="text-sm font-semibold text-gray-500 mb-1 block">Arrondissement <span className="text-rose-500">*</span></span>
        <select
          value={values.districtId || ""}
          onChange={handleDistrictChange}
          disabled={!values.municipalityId}
          required
          className={SELECT_CLASS}
        >
          <option value="">— Sélectionner un arrondissement —</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </label>

      {/* Quartier */}
      <label className="block">
        <span className="text-sm font-semibold text-gray-500 mb-1 block">
          Quartier
          {isNeighborhoodRequired && <span className="text-rose-500 ml-1">*</span>}
        </span>
        <select
          value={values.neighborhoodId || ""}
          onChange={handleNeighborhoodChange}
          disabled={!values.districtId}
          required={isNeighborhoodRequired}
          className={SELECT_CLASS}
        >
          <option value="">— Sélectionner un quartier —</option>
          {neighborhoods.map((n) => (
            <option key={n.id} value={n.id}>{n.name}</option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default TerritoryCascadeFields;
