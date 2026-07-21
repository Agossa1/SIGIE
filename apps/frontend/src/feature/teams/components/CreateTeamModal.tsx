import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { fetchUsers } from "../../users/services/users.thunk";
import { selectAllUsers } from "../../users/services/users.selectors";
import type { UserWithRoles } from "../../users/services/users.api";
import type { CreateTeamDTO } from "../services/teams.types";
import { User_Role } from "../../auth/services/auth.types";

interface CreateTeamModalProps {
  onClose: () => void;
  onSubmit: (data: CreateTeamDTO) => Promise<void>;
}

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateTeamDTO>({
    name: "",
    teamType: "field_team",
    description: "",
    supervisorId: "",
    memberIds: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supervisors, setSupervisors] = useState<UserWithRoles[]>([]);
  const [agents, setAgents] = useState<UserWithRoles[]>([]);

  const dispatch = useAppDispatch();
  const allUsers = useAppSelector(selectAllUsers);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    const filteredSupervisors = allUsers.filter((u) => u.roles.includes(User_Role.SUPERVISOR) || u.roles.includes(User_Role.TEAM_LEADER));
    setSupervisors(filteredSupervisors);
    
    const filteredAgents = allUsers.filter((u) => 
      u.roles.includes(User_Role.TECHNICIAN) || 
      u.roles.includes(User_Role.TEAM_LEADER) || 
      u.roles.includes(User_Role.SUPERVISOR)
    );
    setAgents(filteredAgents);
  }, [allUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      setLoading(true);
      setError(null);
      await onSubmit({
        ...formData,
        supervisorId: formData.supervisorId || undefined, // undefined if empty string
        memberIds: formData.memberIds?.length ? formData.memberIds : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création de la brigade");
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (userId: string) => {
    setFormData((prev) => {
      const current = prev.memberIds || [];
      if (current.includes(userId)) {
        return { ...prev, memberIds: current.filter((id) => id !== userId) };
      } else {
        return { ...prev, memberIds: [...current, userId] };
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-medium text-gray-900">Nouvelle Brigade (Équipe)</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="createTeamForm" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la brigade *</label>
              <input
                type="text"
                required
                minLength={3}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 transition-all text-sm outline-none"
                placeholder="Ex: Brigade d'assainissement Littoral"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'équipe</label>
                <select
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 transition-all text-sm outline-none"
                  value={formData.teamType || ""}
                  onChange={(e) => setFormData({ ...formData, teamType: e.target.value })}
                  disabled={loading}
                >
                  <option value="field_team">Opérations Terrain</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="emergency">Intervention Urgence</option>
                  <option value="inspection">Inspection / Contrôle</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Superviseur / Chef</label>
                <select
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 transition-all text-sm outline-none"
                  value={formData.supervisorId || ""}
                  onChange={(e) => setFormData({ ...formData, supervisorId: e.target.value })}
                  disabled={loading}
                >
                  <option value="">— Aucun / Assigner plus tard —</option>
                  {supervisors.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optionnelle)</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 transition-all text-sm outline-none resize-y"
                placeholder="Secteur d'activité, zone géographique, spécialités..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Membres de l'équipe</label>
              <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <div className="max-h-40 overflow-y-auto p-2 space-y-1">
                  {agents.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-2">Aucun agent disponible</div>
                  ) : (
                    agents.map((agent) => {
                      const isSelected = formData.memberIds?.includes(agent.id);
                      return (
                        <label
                          key={agent.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? "bg-indigo-50" : "hover:bg-gray-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            checked={isSelected || false}
                            onChange={() => toggleMember(agent.id)}
                            disabled={loading}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              {agent.firstName} {agent.lastName}
                            </span>
                            <span className="text-sm font-medium text-gray-500">
                              {agent.roles.join(', ').replace(/_/g, " ")}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            form="createTeamForm"
            type="submit"
            disabled={loading || !formData.name || formData.name.length < 3}
            className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            )}
            Créer la brigade
          </button>
        </div>
      </div>
    </div>
  );
};
