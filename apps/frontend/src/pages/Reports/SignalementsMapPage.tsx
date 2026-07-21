import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../stores/hooks";
import { useAuthRoles } from "../../feature/auth/hooks/useAuthRoles";
import { buildRolePath } from "../shared/rolePages.config";
import type { TerritoryFormValues } from "../../feature/territory/services/territory.types";
import { territoryApi } from "../../feature/territory/services/territory.api";
// import { useTerritoryMapScope } from "../../feature/territory/hooks/useTerritoryMapScope";
// import { presetForRoles } from "../../feature/territory/services/mapLayerPresets";
import {
  // TERRITORY_LAYER_CONFIG,
  // type TerritoryLayerKey,
} from "../../feature/territory/components/territorialMapShared";
import TerritoryCascadeFields from "../../feature/reports/components/TerritoryCascadeFields";
import PhotoCaptureField from "../../feature/reports/components/PhotoCaptureField";
import { createReport, deleteReport, fetchReports, updateReport } from "../../feature/reports/services/reports.thunk";
import { selectAllReports, selectReportsLoading, selectReportsError } from "../../feature/reports/services/reports.selectors";
import { selectCurrentUser } from "../../feature/auth/services/auth.selectors";
import { FieldReportStatus, IssueCategory, type CreateReportDTO } from "../../feature/reports/services/reports.types";
import RoleGuard from "../../feature/auth/components/RoleGuard";
import { User_Role } from "../../feature/auth/services/auth.types";
import { StatusBadge } from "../../feature/reports/components/StatusBadge";
import { CategoryBadge } from "../../feature/reports/components/CategoryBadge";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import UnifiedMap from "../../components/map/UnifiedMap";
import type { IncidentPin } from "../../components/map/UnifiedMap";
// ── MODÈLES RAPIDES D'INCIDENTS (niveau module – stables entre les re-rendus) ──
const QUICK_TEMPLATES = [
  {
    label: "Nid de poule",
    icon: "🕳️",
    data: {
      title: "Nid de poule dangereux",
      description: "Dégradation importante de la chaussée nécessitant un rebouchage urgent pour la sécurité.",
      issueCategory: IssueCategory.ROAD,
    },
    specialDetails: { type: 'road' as const, details: { damageSurfaceM2: 2, potholeDepthCm: 10 } },
  },
  {
    label: "Caniveau bouché",
    icon: "🌊",
    data: {
      title: "Caniveau bouché (Risque Inondation)",
      description: "Le collecteur est obstrué par du sable et des déchets plastiques, l'eau ne circule plus.",
      issueCategory: IssueCategory.DRAINAGE,
    },
    specialDetails: { type: 'drainage' as const, details: { blockageLevelPct: 80, waterLevelCm: 20, flowStatus: 'blocked' } },
  },
  {
    label: "Dépôt d'ordures",
    icon: "🗑️",
    data: {
      title: "Dépôt sauvage d'ordures",
      description: "Amoncellement de déchets ménagers non autorisés sur la voie publique.",
      issueCategory: IssueCategory.WASTE,
    },
    specialDetails: { type: 'waste' as const, details: { estimatedVolumeM3: 3, wasteType: 'ménager' } },
  },
  {
    label: "Observation Faune/Flore",
    icon: "🌿",
    data: {
      title: "Observation biodiversité",
      description: "Signalement d'une espèce animale ou végétale remarquable dans la zone.",
      issueCategory: IssueCategory.BIODIVERSITY,
    },
    specialDetails: { type: 'biodiversity' as const, details: { speciesName: "", observationType: "fauna", count: 1 } },
  },
  {
    label: "Pollution Air/Eau",
    icon: "🧪",
    data: {
      title: "Incident environnemental",
      description: "Signalement d'une pollution suspecte ou d'une dégradation de la qualité de l'air ou de l'eau.",
      issueCategory: IssueCategory.WATER_QUALITY,
    },
    specialDetails: { type: 'environment' as const, details: { measuredValue: 0, unit: "ppm" } },
  },
];

const SignalementsMapPage = ({ embedded = false }: { embedded?: boolean }) => {
  const dispatch = useAppDispatch();
  const { roles } = useAuthRoles();
  // const scope = useTerritoryMapScope();
  const allReports = useAppSelector(selectAllReports) ?? [];
  const currentUser = useAppSelector(selectCurrentUser);
  
  // Le backend filtre automatiquement selon le rôle (territoire/équipe)
  // Pas de filtre local — les données viennent déjà filtrées du backend
  const reports = allReports;

  const incidentPins = useMemo<IncidentPin[]>(() => {
    return reports
      .filter((r) => r.latitude != null && r.longitude != null)
      .map((r) => ({
        id: r.id,
        title: r.title || 'Signalement',
        category: r.issueCategory,
        priority: r.riskLevel || r.priority || 'medium',
        lat: r.latitude!,
        lng: r.longitude!,
        district: r.districtId || 'Non spécifié',
        reporter: r.creator ? `${r.creator.firstName} ${r.creator.lastName}` : (r.createdBy || 'Agent'),
        reporterRole: r.creator?.roleCode || undefined,
        reporterRoleCode: r.creator?.roleCode || undefined,
        details: r.description || 'Aucune description',
      }));
  }, [reports]);


  const isLoading = useAppSelector(selectReportsLoading);
  const error = useAppSelector(selectReportsError);

  // const preset = useMemo(() => presetForRoles(roles as User_Role[]), [roles]);
  // const _allowedTerritoryLayers = useMemo(
  //   () => layersForPreset(preset) as TerritoryLayerKey[],
  //   [preset]
  // );

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState<CreateReportDTO>({
    title: "",
    description: "",
    issueCategory: IssueCategory.DRAINAGE,
    neighborhoodId: "",
    customNeighborhoodName: "",
    latitude: 0,
    longitude: 0,
  } as CreateReportDTO);
  const [drainageDetails, setDrainageDetails] = useState({ blockageLevelPct: 0, waterLevelCm: 0, flowStatus: "" });
  const [roadDetails, setRoadDetails] = useState({ damageSurfaceM2: 0, potholeDepthCm: 0 });
  const [wasteDetails, setWasteDetails] = useState({ estimatedVolumeM3: 0, wasteType: "" });
  const [biodiversityDetails, setBiodiversityDetails] = useState({ speciesName: "", observationType: "fauna", count: 1 });
  const [environmentDetails, setEnvironmentDetails] = useState({ measuredValue: 0, unit: "" });
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [territory, setTerritory] = useState<TerritoryFormValues>({
    regionId: "",
    municipalityId: "",
    districtId: "",
    neighborhoodId: "",
  });

  const [isGpsFailed, setIsGpsFailed] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // ── Restriction territoriale ──
  // Un technicien ne peut créer un signalement qu'à l'intérieur de sa commune.
  const userMunicipalityId: string | undefined = (currentUser as any)?.municipalityId;
  const isTechnicianOnly = roles.includes(User_Role.TECHNICIAN) && !roles.some(r => r !== User_Role.TECHNICIAN);

  // Violation = technicien + a une commune d'affectation + a sélectionné une commune différente
  const isMunicipalityViolation = useMemo(() => {
    if (!isTechnicianOnly) return false;
    if (!userMunicipalityId) return false;
    if (!territory.municipalityId) return false; // rien sélectionné encore
    return territory.municipalityId !== userMunicipalityId;
  }, [isTechnicianOnly, userMunicipalityId, territory.municipalityId]);

  useEffect(() => {
    dispatch(fetchReports());
  }, [dispatch]);

  // Flag pour empêcher le reverse geocode d'écraser les sélections manuelles
  const [territoryManuallySet, setTerritoryManuallySet] = useState(false);

  const handleTerritoryChange = (
    patch: Partial<TerritoryFormValues>
  ) => {
    setTerritory(prev => ({ ...prev, ...patch }));
    setTerritoryManuallySet(true);
    // Propager toutes les FK dans le formulaire
    setForm(prev => ({
      ...prev,
      ...(patch.regionId !== undefined ? { regionId: patch.regionId || '' } : {}),
      ...(patch.municipalityId !== undefined ? { municipalityId: patch.municipalityId || '' } : {}),
      ...(patch.districtId !== undefined ? { districtId: patch.districtId || '' } : {}),
      ...(patch.neighborhoodId !== undefined ? { neighborhoodId: patch.neighborhoodId || '' } : {}),
    }));
  };

  // Géocodage inverse — seulement si l'utilisateur n'a pas déjà sélectionné manuellement
  useEffect(() => {
    if (territoryManuallySet) return;
    if (!form.latitude || !form.longitude) return;

    territoryApi
      .reverseGeocode(form.latitude, form.longitude)
      .then(res => {
        const data = res.data;
        if (!data) return;

        setTerritory({
          regionId: data.regionId ?? '',
          municipalityId: data.municipalityId ?? '',
          districtId: data.districtId ?? '',
          neighborhoodId: data.neighborhoodId ?? '',
        });
        setForm(prev => ({
          ...prev,
          regionId: data.regionId ?? prev.regionId,
          municipalityId: data.municipalityId ?? prev.municipalityId,
          districtId: data.districtId ?? prev.districtId,
          neighborhoodId: data.neighborhoodId ?? prev.neighborhoodId,
        }));
      })
      .catch(console.error);
  }, [form.latitude, form.longitude, territoryManuallySet]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    setForm(f => ({ ...f, ...template.data }));
    if (template.specialDetails.type === 'drainage') setDrainageDetails(template.specialDetails.details as any);
    if (template.specialDetails.type === 'road') setRoadDetails(template.specialDetails.details as any);
    if (template.specialDetails.type === 'waste') setWasteDetails(template.specialDetails.details as any);
    if (template.specialDetails.type === 'biodiversity') setBiodiversityDetails(template.specialDetails.details as any);
    if (template.specialDetails.type === 'environment') setEnvironmentDetails(template.specialDetails.details as any);
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (form.issueCategory === IssueCategory.DRAINAGE) {
      setDrainageDetails((prev) => ({ ...prev, [name]: name === "flowStatus" ? value : Number(value) || 0 }));
    }
    if (form.issueCategory === IssueCategory.ROAD) {
      setRoadDetails((prev) => ({ ...prev, [name]: Number(value) || 0 }));
    }
    if (form.issueCategory === IssueCategory.WASTE) {
      setWasteDetails((prev) => ({ ...prev, [name]: name === "wasteType" ? value : Number(value) || 0 }));
    }
    if (form.issueCategory === IssueCategory.BIODIVERSITY) {
      setBiodiversityDetails((prev) => ({ ...prev, [name]: (name === "speciesName" || name === "observationType") ? value : Number(value) || 0 }));
    }
    if (form.issueCategory === IssueCategory.WATER_QUALITY || form.issueCategory === IssueCategory.AIR_QUALITY) {
      setEnvironmentDetails((prev) => ({ ...prev, [name]: name === "unit" ? value : Number(value) || 0 }));
    }
  };

  const buildPayload = (): CreateReportDTO => {
    const payload: any = {
      ...form,
      priority: "medium",
      riskLevel: "medium",
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    };

    if (photoBase64) {
      payload.photoBase64 = photoBase64;
    }

    if (form.issueCategory === IssueCategory.DRAINAGE) payload.drainageDetails = drainageDetails;
    if (form.issueCategory === IssueCategory.ROAD) payload.roadDetails = roadDetails;
    if (form.issueCategory === IssueCategory.WASTE) payload.wasteDetails = wasteDetails;
    if (form.issueCategory === IssueCategory.BIODIVERSITY) payload.biodiversityDetails = biodiversityDetails;
    if (form.issueCategory === IssueCategory.WATER_QUALITY || form.issueCategory === IssueCategory.AIR_QUALITY) payload.environmentDetails = environmentDetails;

    if (territory.regionId) payload.regionId = territory.regionId;
    if (territory.municipalityId) payload.municipalityId = territory.municipalityId;
    if (territory.districtId) payload.districtId = territory.districtId;

    // Clean up empty optional fields
    if (!payload.neighborhoodId) delete payload.neighborhoodId;
    if (!payload.customNeighborhoodName) delete payload.customNeighborhoodName;
    if (!payload.infrastructureId) delete payload.infrastructureId;
    if (!payload.mappedAreaId) delete payload.mappedAreaId;
    if (!payload.description) delete payload.description;

    return payload as CreateReportDTO;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    // Sécurité : ne pas envoyer si les coordonnées sont à 0 (évite la 400 backend)
    if (form.latitude === 0 && form.longitude === 0) {
      alert("Veuillez sélectionner un point sur la carte avant de soumettre.");
      return;
    }

    // Restriction : un technicien ne peut pas créer un signalement hors de sa commune
    if (isMunicipalityViolation) {
      alert("Vous n'êtes pas autorisé à créer un signalement en dehors de votre commune d'affectation.");
      return;
    }

    const result = await dispatch(createReport(buildPayload()));
    if (createReport.fulfilled.match(result)) {
      setSuccessMessage("Rapport créé avec succès.");
      setForm({ 
        title: "", 
        description: "", 
        issueCategory: IssueCategory.DRAINAGE,
        neighborhoodId: "",
        customNeighborhoodName: "",
        latitude: 0,
        longitude: 0,
      } as CreateReportDTO);
      setTerritory({ regionId: "", municipalityId: "", districtId: "", neighborhoodId: "" });
      setPhotoBase64(null);
      setDrainageDetails({ blockageLevelPct: 0, waterLevelCm: 0, flowStatus: "" });
      setRoadDetails({ damageSurfaceM2: 0, potholeDepthCm: 0 });
      setWasteDetails({ estimatedVolumeM3: 0, wasteType: "" });
      setBiodiversityDetails({ speciesName: "", observationType: "fauna", count: 1 });
      setEnvironmentDetails({ measuredValue: 0, unit: "" });
      dispatch(fetchReports());

      // Auto-hide success message
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const handleChangeStatus = async (id: string, status: FieldReportStatus) => {
    await dispatch(updateReport({ id, data: { status } }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce rapport ?")) {
      await dispatch(deleteReport(id));
    }
  };

  const visibleDetails = useMemo(() => {
    if (form.issueCategory === IssueCategory.DRAINAGE) {
      return (
        <div className="grid gap-4 md:grid-cols-3 bg-gray-50/50 p-4 rounded border border-gray-100">
          <label className="block">
            <span className="text-sm font-medium text-gray-500 mb-1.5 block">Blocage (%)</span>
            <input type="number" name="blockageLevelPct" value={drainageDetails.blockageLevelPct ?? ""} onChange={handleDetailChange} className="w-full   border border-gray-200 bg-white px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-500 mb-1.5 block">Hauteur d'eau (cm)</span>
            <input type="number" name="waterLevelCm" value={drainageDetails.waterLevelCm ?? ""} onChange={handleDetailChange} className="w-full   border border-gray-200 bg-white px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-500 mb-1.5 block">Statut du Flux</span>
            <input type="text" name="flowStatus" value={drainageDetails.flowStatus || ""} onChange={handleDetailChange} placeholder="Ex: Stagnant, Rapide..." className="w-full   border border-gray-200 bg-white px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none" />
          </label>
        </div>
      );
    }
    if (form.issueCategory === IssueCategory.ROAD) {
      return (
        <div className="grid gap-4 md:grid-cols-2 bg-gray-50/50 p-4   border border-gray-100">
          <label className="block">
            <span className="text-sm font-medium text-gray-500 mb-1.5 block">Surface endommagée (m²)</span>
            <input type="number" name="damageSurfaceM2" value={roadDetails.damageSurfaceM2 ?? ""} onChange={handleDetailChange} className="w-full   border border-gray-200 bg-white px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-500 mb-1.5 block">Profondeur moyenne (cm)</span>
            <input type="number" name="potholeDepthCm" value={roadDetails.potholeDepthCm ?? ""} onChange={handleDetailChange} className="w-full   border border-gray-200 bg-white px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none" />
          </label>
        </div>
      );
    }
    if (form.issueCategory === IssueCategory.WASTE) {
      return (
        <div className="grid gap-4 md:grid-cols-2 bg-gray-50/50 p-4  l border border-gray-100">
          <label className="block">
            <span className="text-sm font-medium text-gray-500 mb-1.5 block">Volume estimé (m³)</span>
            <input type="number" name="estimatedVolumeM3" value={wasteDetails.estimatedVolumeM3 ?? ""} onChange={handleDetailChange} className="w-full   border border-gray-200 bg-white px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-500 mb-1.5 block">Type de déchets</span>
            <input type="text" name="wasteType" value={wasteDetails.wasteType || ""} onChange={handleDetailChange} placeholder="Ex: Organique, Plastique..." className="w-full   border border-gray-200 bg-white px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none" />
          </label>
        </div>
      );
    }
    if (form.issueCategory === IssueCategory.BIODIVERSITY) {
      return (
        <div className="grid gap-4 md:grid-cols-3 bg-gray-50/50 p-4 border border-gray-100">
          <label className="block">
            <span className="text-sm font-medium text-gray-500 mb-1.5 block">Espèce</span>
            <input type="text" name="speciesName" value={biodiversityDetails.speciesName || ""} onChange={handleDetailChange} placeholder="Ex: Baobab, Héron..." className="w-full border border-gray-200 bg-white px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-500 mb-1.5 block">Type d'observation</span>
            <select name="observationType" value={biodiversityDetails.observationType} onChange={handleDetailChange as any} className="w-full border border-gray-200 bg-white px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none">
              <option value="fauna">Faune</option>
              <option value="flora">Flore</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-500 mb-1.5 block">Nombre</span>
            <input type="number" name="count" value={biodiversityDetails.count ?? ""} onChange={handleDetailChange} className="w-full border border-gray-200 bg-white px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none" />
          </label>
        </div>
      );
    }
    if (form.issueCategory === IssueCategory.WATER_QUALITY || form.issueCategory === IssueCategory.AIR_QUALITY) {
      return (
        <div className="grid gap-4 md:grid-cols-2 bg-gray-50/50 p-4 border border-gray-100">
          <label className="block">
            <span className="text-sm font-medium text-gray-500 mb-1.5 block">Valeur mesurée</span>
            <input type="number" name="measuredValue" value={environmentDetails.measuredValue ?? ""} onChange={handleDetailChange} className="w-full border border-gray-200 bg-white px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-500 mb-1.5 block">Unité</span>
            <input type="text" name="unit" value={environmentDetails.unit || ""} onChange={handleDetailChange} placeholder="Ex: mg/L, ppm, AQI..." className="w-full border border-gray-200 bg-white px-3.5 py-2.5 text-sm transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none" />
          </label>
        </div>
      );
    }
    return null;
  }, [form.issueCategory, drainageDetails, roadDetails, wasteDetails, biodiversityDetails, environmentDetails]);

  const dashboardPath = buildRolePath(roles, "dashboard");

  const content = (
        <div className={`mx-auto max-w-[1400px] space-y-4 sm:space-y-6 md:space-y-8 ${embedded ? "" : ""}`}>

          {!embedded && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 sm:p-6 border border-gray-100">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-emerald-600 flex items-center justify-center text-white shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-medium text-gray-900">Signalements Agents</h1>
                <p className="mt-0.5 sm:mt-1 text-sm sm:text-sm font-medium text-gray-500">Supervision et création des signalements techniques</p>
              </div>
            </div>
            <Link to={dashboardPath} className="self-start sm:self-auto inline-flex items-center gap-2 rounded-sm bg-white px-4 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-200 transition-all hover:bg-gray-50 hover:ring-gray-300">
              ← Retour au Dashboard
            </Link>
          </div>
          )}

          {embedded && (
          <div className="bg-white p-4 sm:p-6 border border-gray-100 rounded-xl">
            <h2 className="text-lg font-medium text-gray-900">Signalements agents</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">Création et suivi de vos signalements techniques</p>
          </div>
          )}

          <div className="grid gap-4 sm:gap-6 md:gap-8 xl:grid-cols-[1fr_400px]">

            {/* Liste des Rapports */}
            <section className="flex flex-col border border-gray-100 rounded-2xl bg-white overflow-hidden order-2 xl:order-1 shadow-sm">
              <div className="p-5 sm:p-7 border-b border-gray-100 flex items-center justify-between bg-white">
                <div>
                  <h2 className="text-base sm:text-lg font-medium text-gray-900">Signalements Récents</h2>
                  <p className="text-sm sm:text-sm font-medium text-gray-500 mt-1">Gérez le statut des interventions sur le terrain.</p>
                </div>
                <div className="flex items-center gap-2">
                  {isLoading && <LoadingSpinner size="xs" />}
                  <span className="rounded-full bg-yellow-50 px-2 sm:px-3 py-1 text-sm sm:text-sm text-gray-700 ring-1 ring-inset ring-yellow-600/10">{reports.length} total</span>
                </div>
              </div>

              {error && (
                <div className="m-6 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-medium text-rose-800 flex items-center gap-3">
                  <svg className="w-5 h-5 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  {error}
                </div>
              )}

              {/* Ajout d'une barre de défilement stylisée et visible pour défiler de gauche à droite */}
              <div className="overflow-x-auto flex-1 pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-50 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 transition-all">
                <table className="min-w-full divide-y divide-gray-100 text-left whitespace-nowrap">
                  <thead className="bg-gray-50/50 text-sm font-medium   text-gray-800">
                    <tr>
                      <th className="px-6 py-4">Signalement</th>
                      <th className="px-6 py-4">Catégorie</th>
                      <th className="px-6 py-4">Statut Actuel</th>
                      <th className="px-6 py-4">Déclaré par</th>
                      <th className="px-6 py-4">Heure</th>
                      <th className="px-6 py-4 text-right">Actions Rapides</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {!reports.length ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm font-medium text-gray-400">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Aucun rapport disponible.
                          </div>
                        </td>
                      </tr>
                    ) : reports.map((report) => (
                      <tr key={report.id} className="transition-colors hover:bg-gray-50/50 group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {(report.photoUrl || report.photoBase64) ? (
                              <div 
                                className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200 shrink-0 shadow-sm cursor-zoom-in group/photo" 
                                onClick={() => setSelectedPhoto(report.photoUrl || report.photoBase64 || null)}
                                title="Agrandir la photo"
                              >
                                <img 
                                  src={report.photoUrl || report.photoBase64} 
                                  alt="Incident" 
                                  className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-200" 
                                />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center shrink-0 text-gray-300" title="Aucune photo">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-gray-900">{report.title}</div>
                              {report.description && <div className="text-sm text-gray-500 mt-1.5 max-w-[250px] truncate">{report.description}</div>}
                              {(report.neighborhoodName || report.districtName || report.municipalityName) && (
                                <div className="text-xs font-medium text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 mt-2.5 rounded-md inline-flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                  {[report.neighborhoodName, report.districtName, report.municipalityName].filter(Boolean).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <CategoryBadge category={report.issueCategory} />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={report.status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 shrink-0">
                                {report.creator
                                  ? `${report.creator.firstName?.[0] ?? ''}${report.creator.lastName?.[0] ?? ''}`.toUpperCase() || 'U'
                                  : 'U'}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-800">
                                  {report.creator
                                    ? `${report.creator.firstName ?? ''} ${report.creator.lastName ?? ''}`.trim() || report.creator.email || '—'
                                    : '—'}
                                </div>
                                {report.creator?.roleCode && (
                                  <span className="inline-block mt-0.5 text-sm font-medium bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                                    {report.creator.roleCode}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 whitespace-nowrap">
                            <div className="font-medium text-gray-700">
                              {new Date(report.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="mt-0.5">
                              {new Date(report.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {report.status !== FieldReportStatus.IN_PROGRESS && (
                              <button
                                type="button"
                                title="Marquer en cours"
                                onClick={() => handleChangeStatus(report.id, FieldReportStatus.IN_PROGRESS)}
                                className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors"
                              >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              </button>
                            )}
                            <button
                              type="button"
                              title="Supprimer"
                              onClick={() => handleDelete(report.id)}
                              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Formulaire de création */}
            <section className="border border-gray-100 rounded-2xl bg-white p-5 sm:p-7 shadow-sm self-start order-1 xl:order-2 xl:sticky xl:top-8">
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-lg font-medium text-gray-900">Nouveau Rapport</h2>
                  <p className="text-sm sm:text-sm text-emerald-600 mt-1">Déclarez un incident nécessitant une intervention.</p>
                </div>
              </div>

              {successMessage && (
                <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <label className="block">
                  <span className="text-sm font-medium text-gray-800 mb-2 block">Titre de l'incident <span className="text-rose-500">*</span></span>
                  <select
                    name="title"
                    value={QUICK_TEMPLATES.some(t => t.data.title === form.title) ? form.title : "_custom"}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "_custom") {
                        setForm(f => ({ ...f, title: "" }));
                      } else {
                        const tpl = QUICK_TEMPLATES.find(t => t.data.title === val);
                        if (tpl) applyTemplate(tpl);
                      }
                    }}
                    className="w-full border border-gray-200 bg-gray-50/50 hover:bg-gray-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white outline-none rounded-xl appearance-none cursor-pointer font-medium text-gray-700"
                    required
                  >
                    <option value="">— Sélectionner un type d'incident —</option>
                    {QUICK_TEMPLATES.map((tpl, i) => (
                      <option key={i} value={tpl.data.title}>{tpl.icon} {tpl.label} — {tpl.data.title}</option>
                    ))}
                    <option value="_custom">✏️ Autre (saisie libre)...</option>
                  </select>
                  {(!form.title || form.title === "_custom" || !QUICK_TEMPLATES.some(t => t.data.title === form.title)) && (
                    <div className="mt-3 relative animate-in fade-in slide-in-from-top-2 duration-300">
                      <input
                        name="title"
                        value={form.title === "_custom" ? "" : (form.title || "")}
                        onChange={handleChange}
                        placeholder="Décrivez l'incident en quelques mots..."
                        className="w-full border border-gray-200 bg-white px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none rounded-xl"
                        required
                      />
                    </div>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-gray-800 mb-2 block">Description détaillée</span>
                  <textarea
                    name="description"
                    value={form.description || ""}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Détails supplémentaires sur le problème..."
                    className="w-full border border-gray-200 bg-white px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none rounded-xl resize-none"
                  />
                </label>

                <PhotoCaptureField value={photoBase64} onChange={setPhotoBase64} />

                <TerritoryCascadeFields
                  values={territory}
                  onChange={handleTerritoryChange}
                  isNeighborhoodRequired={!(form as any).customNeighborhoodName}
                />

                <label className="block bg-gray-50/50 p-4 border border-dashed border-gray-200 rounded-xl">
                  <span className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Lieu-dit ou Quartier (Manuel)
                  </span>
                  <span className="text-sm text-gray-500 block mb-2 leading-tight">
                    Si votre quartier n'apparaît pas dans la liste déroulante ou sur la carte, 
                    saisissez son nom précis ici (Cela annule la nécessité de choisir dans la liste).
                  </span>
                  <input
                    name="customNeighborhoodName"
                    value={(form as any).customNeighborhoodName || ""}
                    onChange={handleChange}
                    placeholder="Ex: Quartier Zongo, Rue des Manguiers..."
                    className="w-full border border-gray-200 bg-white px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none rounded-xl"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2 relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-gray-700 block">Géolocalisation (Carte) <span className="text-rose-500">*</span></span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsMapExpanded(true)}
                          className="text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                          title="Agrandir la carte pour plus de précision"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                          Agrandir
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(
                                (position) => {
                                  setIsGpsFailed(false);
                                  setForm(f => ({
                                    ...f,
                                    latitude: position.coords.latitude,
                                    longitude: position.coords.longitude
                                  }));
                                },
                                (_error) => {
                                  setIsGpsFailed(true);
                                  fetch("https://get.geojs.io/v1/ip/geo.json")
                                    .then((res) => res.json())
                                    .then((data) => {
                                      if (data && data.latitude && data.longitude) {
                                        const lat = Number(data.latitude);
                                        const lon = Number(data.longitude);
                                        setForm(f => ({ ...f, latitude: lat, longitude: lon }));
                                        setIsGpsFailed(false);
                                      } else {
                                        alert("Impossible d'obtenir la position automatique.");
                                      }
                                    })
                                    .catch(() => alert("Impossible d'obtenir la position automatique."));
                                },
                                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                              );
                            } else {
                              setIsGpsFailed(true);
                              alert("La géolocalisation n'est pas supportée par votre navigateur.");
                            }
                          }}
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Ma position GPS
                        </button>
                      </div>
                    </div>

                    <div className="mb-2 w-full">
                      {/* MapView Inline */}
                      {/* ⚠️ Garder la carte montée en permanence (hidden au lieu de conditionnel)
                          pour éviter l'erreur React "removeChild" quand Leaflet/Maplibre manipule le DOM. */}
                      <div 
                        className={`w-full border border-gray-200 rounded-xl overflow-hidden z-0 relative bg-gray-50 ${isMapExpanded ? 'hidden' : ''}`}
                      >
                        <UnifiedMap
                          height="16rem"
                          hideLegend={true}
                          incidentsData={incidentPins}
                          center={form.latitude ? { lat: form.latitude, lng: form.longitude, zoom: 14 } : null}
                          customMarker={(form.latitude !== 0 || form.longitude !== 0) ? { lat: form.latitude, lng: form.longitude } : null}
                          onMapClick={(lat, lng) => {
                            setForm(f => ({ ...f, latitude: lat, longitude: lng }));
                            setIsGpsFailed(false);
                          }}
                        />
                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        step="any"
                        name="latitude"
                        value={form.latitude}
                        onChange={handleChange}
                        readOnly={!isGpsFailed}
                        placeholder="Latitude"
                        className={`w-full border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl ${!isGpsFailed ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"}`}
                        required
                      />
                      <input
                        type="number"
                        step="any"
                        name="longitude"
                        value={form.longitude}
                        onChange={handleChange}
                        readOnly={!isGpsFailed}
                        placeholder="Longitude"
                        className={`w-full border border-gray-200 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl ${!isGpsFailed ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white"}`}
                        required
                      />
                    </div>
                    {form.latitude === 0 && form.longitude === 0 && !isGpsFailed && (
                      <p className="text-sm text-rose-500 mt-1.5 font-medium">Cliquez sur la carte ou utilisez le GPS pour obtenir les coordonnées.</p>
                    )}
                  </div>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-gray-800 mb-2 block">Catégorie <span className="text-rose-500">*</span></span>
                  <select
                    name="issueCategory"
                    value={form.issueCategory}
                    onChange={handleChange}
                    className="w-full border border-gray-200 bg-white hover:bg-gray-50 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none rounded-xl appearance-none cursor-pointer font-medium text-gray-700"
                  >
                    {Object.values(IssueCategory).map((category) => (
                      <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                    ))}
                  </select>
                </label>

                {visibleDetails && (
                  <div className="pt-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="text-sm font-medium text-emerald-700 mb-3 flex items-center gap-2">
                      Détails spécifiques
                      <div className="flex-1 h-px bg-gray-100"></div>
                    </div>
                    {visibleDetails}
                  </div>
                )}

                <div className="pt-4">
                  {/* Avertissement restriction commune */}
                  {isMunicipalityViolation && (
                    <div className="mb-3 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                      <svg className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-semibold">Zone hors périmètre</p>
                        <p className="text-sm mt-0.5 text-amber-700">Vous ne pouvez pas créer un signalement en dehors de votre commune d’affectation. Veuillez sélectionner un point dans votre zone.</p>
                      </div>
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading || isMunicipalityViolation}
                    className="w-full relative flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-medium text-white transition-all hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-500/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" variant="onDark" label="Transmission…" />
                    ) : (
                      <>
                        {isMunicipalityViolation ? '🚫 Hors zone — signalement refusé' : 'Créer le signalement'}
                        {!isMunicipalityViolation && (
                          <svg className="w-4 h-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>
          </div>
          
          {/* Visionneuse de photo HD */}
          {selectedPhoto && (
            <div 
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4 cursor-zoom-out"
              onClick={() => setSelectedPhoto(null)}
            >
              <div 
                className="relative max-w-3xl w-full bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl border border-gray-100 p-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setSelectedPhoto(null)} 
                  className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-8 h-8 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center shadow-lg transition-colors cursor-pointer"
                >
                  ✕
                </button>
                <img src={selectedPhoto} alt="Preuve terrain" className="w-full max-h-[60vh] sm:max-h-[75vh] object-contain bg-gray-900 rounded" />
                <div className="p-3 sm:p-4 bg-white text-center">
                  <p className="text-sm font-medium text-gray-700">Preuve photographique capturée sur le terrain par l'agent</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Modale plein écran de la Carte Ops ───────────────── */}
          {isMapExpanded && createPortal(
            <div className="fixed inset-0 z-[9999] flex flex-col bg-white">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-medium text-gray-900">Ciblage Géographique (Plein écran)</h2>
                    <p className="text-sm text-gray-500 font-medium">Cliquez sur un point de la carte pour valider les coordonnées de l'incident.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold px-2 py-1 bg-gray-100 rounded text-gray-600 border border-gray-200">
                    Pos: {form.latitude ? form.latitude.toFixed(5) : '---'}, {form.longitude ? form.longitude.toFixed(5) : '---'}
                  </span>
                  <button
                    onClick={() => setIsMapExpanded(false)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-emerald-600 bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-all cursor-pointer shadow-md"
                  >
                    Valider le point & Fermer
                  </button>
                </div>
              </div>
              <div 
                className="flex-1 w-full bg-gray-50 relative flex flex-col p-2"
              >
                <UnifiedMap
                  height="100%"
                  hideLegend={false}
                  incidentsData={incidentPins}
                  center={form.latitude ? { lat: form.latitude, lng: form.longitude, zoom: 14 } : null}
                  customMarker={(form.latitude !== 0 || form.longitude !== 0) ? { lat: form.latitude, lng: form.longitude } : null}
                  onMapClick={(lat, lng) => {
                    setForm(f => ({ ...f, latitude: lat, longitude: lng }));
                    setIsGpsFailed(false);
                  }}
                />
              </div>
            </div>,
            document.body
          )}

        </div>
  );

  return (
    <RoleGuard allowedRoles={[User_Role.SUPER_ADMIN, User_Role.PLATFORM_ADMIN, User_Role.MAYOR, User_Role.TECHNICIAN, User_Role.TEAM_LEADER, User_Role.SUPERVISOR]} fallback={<div className="min-h-screen flex items-center justify-center p-6 text-sm text-gray-500 bg-gray-50">Accès non autorisé.</div>}>
      {embedded ? content : (
        <div className="min-h-screen bg-[#F8FAFC] p-3 sm:p-4 md:p-8">
          {content}
        </div>
      )}
    </RoleGuard>
  );
};

export default SignalementsMapPage;
