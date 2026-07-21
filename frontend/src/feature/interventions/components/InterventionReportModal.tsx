import React, { useState } from "react";
import type { CreateInterventionReportDTO } from "../services/interventions.types";

interface InterventionReportModalProps {
  interventionId: string;
  onClose: () => void;
  onSubmit: (id: string, data: CreateInterventionReportDTO) => Promise<void>;
}

export const InterventionReportModal: React.FC<InterventionReportModalProps> = ({
  interventionId,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateInterventionReportDTO>({
    workDone: "",
    blockageRemovedPct: undefined,
    finalConditionScore: undefined,
    recommendations: "",
    completed: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workDone.trim()) return;
    try {
      setLoading(true);
      setError(null);
      await onSubmit(interventionId, formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la soumission du rapport");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Rapport d'intervention</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Travaux effectués *
            </label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm outline-none resize-y"
              placeholder="Décrivez les travaux effectués durant l'intervention..."
              value={formData.workDone}
              onChange={(e) => setFormData({ ...formData, workDone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                % Déblocage
              </label>
              <input
                type="number"
                min={0}
                max={100}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 transition-all text-sm outline-none"
                placeholder="0 – 100"
                value={formData.blockageRemovedPct ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    blockageRemovedPct: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Score état final (0–10)
              </label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.5}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 transition-all text-sm outline-none"
                placeholder="0 – 10"
                value={formData.finalConditionScore ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    finalConditionScore: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recommandations
            </label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm outline-none resize-y"
              placeholder="Actions de suivi recommandées..."
              value={formData.recommendations ?? ""}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded accent-indigo-600"
              checked={formData.completed ?? false}
              onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
            />
            <span className="text-sm font-medium text-gray-700">Marquer l'intervention comme terminée</span>
          </label>

          <div className="pt-2 flex justify-end gap-3">
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
              disabled={loading || !formData.workDone.trim()}
              className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
              <span>{loading ? "Enregistrement..." : "Valider le rapport"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
