import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
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
    completionPercentage: undefined,
    photosBefore: [""],
    photosAfter: [""],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputBeforeRef = useRef<HTMLInputElement>(null);
  const fileInputAfterRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'photosBefore' | 'photosAfter'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate an upload by generating an object URL
      const url = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        [field]: [url]
      }));
    }
  };

  const removePhoto = (field: 'photosBefore' | 'photosAfter') => {
    setFormData(prev => ({
      ...prev,
      [field]: []
    }));
    // Reset the input value
    if (field === 'photosBefore' && fileInputBeforeRef.current) {
        fileInputBeforeRef.current.value = '';
    }
    if (field === 'photosAfter' && fileInputAfterRef.current) {
        fileInputAfterRef.current.value = '';
    }
  };

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
              Progression globale (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 transition-all text-sm outline-none"
              placeholder="Ex: 50"
              value={formData.completionPercentage ?? ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  completionPercentage: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Photo Avant */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo Avant
              </label>
              {formData.photosBefore && formData.photosBefore.length > 0 && formData.photosBefore[0] ? (
                <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-32">
                    <img src={formData.photosBefore[0]} alt="Avant" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => removePhoto('photosBefore')}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Supprimer la photo"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputBeforeRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-green-300 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="p-2 rounded-full bg-green-50 text-green-500 group-hover:bg-green-100 transition-colors">
                      <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-500 group-hover:text-green-600">Ajouter une photo</span>
                </button>
              )}
              <input
                type="file"
                ref={fileInputBeforeRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'photosBefore')}
              />
            </div>

            {/* Photo Après */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo Après
              </label>
              {formData.photosAfter && formData.photosAfter.length > 0 && formData.photosAfter[0] ? (
                <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-32">
                    <img src={formData.photosAfter[0]} alt="Après" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => removePhoto('photosAfter')}
                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Supprimer la photo"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputAfterRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-green-300 transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="p-2 rounded-full bg-green-50 text-green-500 group-hover:bg-green-100 transition-colors">
                      <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-gray-500 group-hover:text-green-600">Ajouter une photo</span>
                </button>
              )}
              <input
                type="file"
                ref={fileInputAfterRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'photosAfter')}
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
              className="w-4 h-4 rounded accent-green-600"
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
              className="px-6 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors disabled:bg-green-300 flex items-center gap-2 shadow-sm"
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
