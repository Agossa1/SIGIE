import React, { useState, useEffect } from "react";
import type { CreateInterventionDTO } from "../services/interventions.types";
import { usersApi, type UserWithRoles } from "../../users/services/users.api";

const INTERVENTION_TYPES = [
  { value: "drain_cleaning", label: "Curage caniveaux / drains" },
  { value: "waste_collection", label: "Collecte des déchets" },
  { value: "road_repair", label: "Réfection voirie" },
  { value: "flood_response", label: "Réponse aux inondations" },
  { value: "inspection", label: "Inspection terrain" },
  { value: "emergency_response", label: "Intervention d'urgence" },
  { value: "sanitation", label: "Assainissement" },
  { value: "maintenance", label: "Maintenance générale" },
];

interface CreateInterventionModalProps {
  missionId: string;
  onClose: () => void;
  onSubmit: (data: CreateInterventionDTO) => Promise<void>;
}

export const CreateInterventionModal: React.FC<CreateInterventionModalProps> = ({
  missionId,
  onClose,
  onSubmit,
}) => {
  const [interventionType, setInterventionType] = useState("drain_cleaning");
  const [priority, setPriority] = useState("medium");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserWithRoles[]>([]);

  useEffect(() => {
    usersApi.getAllUsers()
      .then(data => setUsers(data.filter(u => u.roles.some(r => r.includes('technician') || r.includes('agent')))))
      .catch(err => console.error("Failed to load users", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await onSubmit({ missionId, interventionType, priority, userId: userId || undefined });
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de l'intervention");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Nouvelle Intervention</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'intervention *
            </label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-sm outline-none"
              value={interventionType}
              onChange={(e) => setInterventionType(e.target.value)}
              required
            >
              {INTERVENTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priorité *
            </label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-sm outline-none"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              required
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
              <option value="urgent">Urgence</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigner à un agent
            </label>
            <select
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-sm outline-none"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              <option value="">-- Non assigné --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
              ))}
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
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Création...
                </>
              ) : (
                "Créer l'intervention"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
