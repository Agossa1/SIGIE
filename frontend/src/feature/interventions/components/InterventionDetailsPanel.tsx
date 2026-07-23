import React from "react";
import { X, Calendar, Clock, User, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import type { Intervention } from "../services/interventions.types";
import { useGetInterventionLogsQuery } from "../services/interventions.rtk";
import { STATUS_CONFIG, INTERVENTION_TYPE_LABELS } from "./InterventionsDashboard";

interface InterventionDetailsPanelProps {
  intervention: Intervention;
  onClose: () => void;
}

export const InterventionDetailsPanel: React.FC<InterventionDetailsPanelProps> = ({
  intervention,
  onClose,
}) => {
  const { data: logs, isLoading: loadingLogs } = useGetInterventionLogsQuery(intervention.id);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-gray-100 transform transition-transform duration-300">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Détails de l'intervention</h2>
          <p className="text-sm text-gray-500 mt-1">{intervention.id.split('-')[0].toUpperCase()}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Résumé */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold   ${STATUS_CONFIG[intervention.status]?.className || 'bg-gray-100'}`}>
              {STATUS_CONFIG[intervention.status]?.label || intervention.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${intervention.priority === 'urgent' ? 'bg-red-100 text-red-700' : intervention.priority === 'high' ? 'bg-orange-100 text-orange-700' : intervention.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
              Priorité : {intervention.priority === 'urgent' ? 'Urgence' : intervention.priority === 'high' ? 'Haute' : intervention.priority === 'medium' ? 'Moyenne' : 'Basse'}
            </span>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
            <p className="text-base font-semibold text-gray-900">
              {INTERVENTION_TYPE_LABELS[intervention.interventionType] ?? intervention.interventionType}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                <User className="w-4 h-4" />
                <span className="text-xs font-medium">Assigné à</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {intervention.agentName || 'Non assigné'}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-medium">Progression</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {intervention.completionPercentage != null ? `${intervention.completionPercentage}%` : '—'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="flex items-center gap-1.5 text-gray-500 mb-1">
                <Calendar className="w-4 h-4" />
                Début
              </span>
              <p className="font-medium text-gray-900">
                {intervention.startedAt ? formatDate(intervention.startedAt) : "—"}
              </p>
            </div>
            <div>
              <span className="flex items-center gap-1.5 text-gray-500 mb-1">
                <Clock className="w-4 h-4" />
                Fin
              </span>
              <p className="font-medium text-gray-900">
                {intervention.endedAt ? formatDate(intervention.endedAt) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Historique / Logs */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-green-600" />
            Historique de l'intervention
          </h3>

          {loadingLogs ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-green-600 border-t-transparent animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-400">Chargement des logs...</p>
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
              <p className="text-sm text-gray-500">Aucun historique disponible.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-4 border-l-2 border-gray-100">
                  <div className="absolute w-2.5 h-2.5 bg-white border-2 border-green-600 rounded-full -left-[6px] top-1.5" />
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      {log.authorName || 'Système'}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(log.createdAt)}</span>
                  </div>
                  {log.logType === 'status_change' && (
                    <p className="text-sm text-gray-600 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      Statut passé à <span className="font-semibold">{STATUS_CONFIG[log.newStatus || '']?.label || log.newStatus}</span>
                    </p>
                  )}
                  {log.logType === 'note' && log.comment && (
                    <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
                      {log.comment}
                    </div>
                  )}
                  {log.logType === 'blocker' && (
                    <div className="mt-2 bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-700">
                      <strong>Point de blocage :</strong> {log.comment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
