import React, { useState, useEffect } from "react";
import { MissionType, PriorityLevel } from "../services/missions.types";
import type { CreateMissionDTO } from "../services/missions.types";
import { teamsApi } from "../../teams/services/teams.api";
import type { Team } from "../../teams/services/teams.types";
import { reportsApi } from "../../reports/services/reports.api";
import type { TechnicianReport } from "../../reports/services/reports.types";
import { StatusBadge } from "../../reports/components/StatusBadge";

interface CreateMissionModalProps {
  onClose: () => void;
  onSubmit: (data: CreateMissionDTO) => Promise<void>;
  initialData?: Partial<CreateMissionDTO>;
}

export const CreateMissionModal: React.FC<CreateMissionModalProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<CreateMissionDTO>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    missionType: initialData?.missionType || MissionType.MAINTENANCE,
    priorityLevel: initialData?.priorityLevel || PriorityLevel.MEDIUM,
    municipalityId: initialData?.municipalityId,
    assignedTeamId: initialData?.assignedTeamId,
    reportId: initialData?.reportId,
    dueDate: initialData?.dueDate ?? "",
    estimatedHours: initialData?.estimatedHours ? Number(initialData.estimatedHours) : 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allTeams, setAllTeams] = useState<Team[]>([]);

  // Report state
  const [allReports, setAllReports] = useState<TechnicianReport[]>([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const fetchedTeams = await teamsApi.getAllTeams();
        setAllTeams(fetchedTeams);
      } catch (err) {
        console.error("Failed to load teams:", err);
      }
    };
    const fetchReports = async () => {
      try {
        const reports = await reportsApi.getAllReports();
        // Only show non-resolved, non-cancelled reports
        setAllReports(reports.filter(r => !['resolved', 'validated', 'cancelled'].includes(r.status)));
      } catch (err) {
        console.error("Failed to load reports:", err);
      }
    };
    fetchTeams();
    fetchReports();
  }, []);



  // Filtrer les équipes par zone (municipalityId) — avec fallback si aucun résultat
  const zoneTeams = allTeams.filter(t => t.municipalityId === formData.municipalityId);
  const availableTeams = formData.municipalityId && zoneTeams.length > 0 ? zoneTeams : allTeams;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    if (!formData.reportId) {
      setError("Veuillez associer un signalement à cette mission.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload: any = { ...formData };
      
      // Clean up empty strings to pass backend Zod validation
      if (!payload.dueDate) delete payload.dueDate;
      else payload.dueDate = new Date(payload.dueDate).toISOString();

      if (!payload.scheduledAt) delete payload.scheduledAt;
      else payload.scheduledAt = new Date(payload.scheduledAt).toISOString();

      if (!payload.description) delete payload.description;
      if (!payload.municipalityId) delete payload.municipalityId;
      if (!payload.assignedTeamId) delete payload.assignedTeamId;
      if (payload.estimatedHours === "") delete payload.estimatedHours;

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de la mission");
    } finally {
      setLoading(false);
    }
  };

  const categoryLabel: Record<string, string> = {
    drainage: "Drainage", waste: "Déchets", road: "Route", lighting: "Éclairage",
    flooding: "Inondation", biodiversity: "Biodiversité", air_quality: "Qualité air",
    water_quality: "Qualité eau", other: "Autre",
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-medium text-gray-900">Nouvelle Mission</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          {/* --- Signalement lié --- */}
          <div className="border border-gray-200 bg-gray-50/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <label className="block text-sm font-medium text-gray-700">
                Signalement associé <span className="text-red-500">*</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 mb-3">Toute mission doit être rattachée à un signalement de terrain.</p>

            <select
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-sm outline-none"
              value={formData.reportId || ""}
              onChange={(e) => {
                const report = allReports.find(r => r.id === e.target.value);
                setFormData(prev => ({
                  ...prev,
                  reportId: e.target.value,
                  municipalityId: report ? (prev.municipalityId || report.municipalityId) : prev.municipalityId
                }));
              }}
            >
              <option value="" disabled>Sélectionner un signalement...</option>
              {allReports.map(report => (
                <option key={report.id} value={report.id}>
                  {report.title} ({categoryLabel[report.issueCategory] ?? report.issueCategory})
                </option>
              ))}
            </select>
            
            {(() => {
              const selected = allReports.find(r => r.id === formData.reportId);
              if (selected) {
                return (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600">Statut actuel du signalement :</span>
                    <StatusBadge status={selected.status} />
                  </div>
                );
              }
              return null;
            })()}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la mission *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-sm outline-none"
              placeholder="Ex: Curage des caniveaux Secteur Nord"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 transition-all text-sm outline-none"
                value={formData.missionType}
                onChange={(e) => setFormData({ ...formData, missionType: e.target.value as MissionType })}
              >
                {Object.values(MissionType).map((type) => (
                  <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priorité *</label>
              <select
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 transition-all text-sm outline-none"
                value={formData.priorityLevel}
                onChange={(e) => setFormData({ ...formData, priorityLevel: e.target.value as PriorityLevel })}
              >
                {Object.values(PriorityLevel).map((prio) => (
                  <option key={prio} value={prio}>{prio}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-sm outline-none min-h-[80px] resize-y"
              placeholder="Détails, objectifs et consignes pour l'équipe..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date limite d'exécution (SLA)</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 transition-all text-sm outline-none"
                value={formData.dueDate || ""}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée estimée (heures)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                placeholder="Ex: 4"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 transition-all text-sm outline-none"
                value={formData.estimatedHours ?? ""}
                onChange={(e) => setFormData((prev: CreateMissionDTO) => ({ ...prev, estimatedHours: e.target.value ? parseFloat(e.target.value) : (undefined as any) }))}
              />
            </div>
          </div>
          
          <div className="border border-gray-200 bg-gray-50/50 rounded-xl p-4">
             <div className="flex items-center justify-between mb-2">
               <label className="block text-sm font-medium text-gray-700">Assigner une Brigade</label>
               {formData.municipalityId && (
                 <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-medium">
                   Filtré pour la zone sélectionnée
                 </span>
               )}
             </div>
             <p className="text-sm text-emerald-600/80 mb-3">L'assignation permet à l'équipe de voir la mission sur l'app mobile.</p>
             <select
                className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white focus:border-emerald-500 transition-all text-sm outline-none"
                value={formData.assignedTeamId || ""}
                onChange={(e) => setFormData({ ...formData, assignedTeamId: e.target.value || undefined })}
              >
                <option value=""> Assigner plus tard (Brouillon) </option>
                {allTeams.length === 0 ? (
                  <option disabled value="">Aucune brigade disponible (reconnectez-vous)</option>
                ) : (
                  availableTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))
                )}
              </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !formData.reportId}
              className="px-6 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
              <span>{loading ? "Création..." : "Créer la mission"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
