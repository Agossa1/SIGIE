import { useState } from "react";
import { MessageSquare, AlertTriangle, Camera, GitBranch, Send } from "lucide-react";
import {
    useGetInterventionLogsQuery,
    useCreateInterventionLogMutation,
} from "../services/interventions.rtk";
import type { InterventionLogType } from "../services/interventions.types";

const LOG_TYPE_CONFIG: Record<InterventionLogType, { label: string; icon: typeof GitBranch; color: string; bg: string }> = {
    status_change: { label: "Changement de statut", icon: GitBranch, color: "text-blue-600", bg: "bg-blue-50" },
    note: { label: "Note", icon: MessageSquare, color: "text-gray-600", bg: "bg-gray-50" },
    blocker: { label: "Blocage", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    photo_added: { label: "Photo", icon: Camera, color: "text-emerald-600", bg: "bg-emerald-50" },
};

interface Props {
    interventionId: string;
}

export const InterventionLogs = ({ interventionId }: Props) => {
    const [comment, setComment] = useState("");
    const { data: logs = [], isLoading } = useGetInterventionLogsQuery(interventionId);
    const [createLog, { isLoading: isPosting }] = useCreateInterventionLogMutation();

    const handleSendNote = async () => {
        if (!comment.trim()) return;
        await createLog({
            interventionId,
            log: { logType: "note", comment: comment.trim() },
        }).unwrap();
        setComment("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendNote();
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-6">
                <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                Journal de l'intervention
            </h3>

            {/* Timeline des logs */}
            <div className="relative pl-6 space-y-0 max-h-64 overflow-y-auto mb-4">
                {/* Ligne verticale */}
                <div className="absolute left-[9px] top-0 bottom-0 w-0.5 bg-gray-200" />

                {logs.length === 0 && (
                    <p className="text-sm text-gray-400 py-3 pl-2">Aucune entrée de journal.</p>
                )}

                {logs.map((log) => {
                    const config = LOG_TYPE_CONFIG[log.logType];
                    const Icon = config.icon;
                    const dateStr = new Date(log.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                    });

                    return (
                        <div key={log.id} className="relative pb-3">
                            <div className={`absolute -left-[15px] top-1 w-4 h-4 rounded-full ${config.bg} border-2 border-gray-300 flex items-center justify-center`}>
                                <Icon className={`w-2.5 h-2.5 ${config.color}`} />
                            </div>
                            <div className="pl-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-semibold text-gray-700">{log.authorName ?? "Système"}</span>
                                    <span className="text-[10px] text-gray-400">{dateStr}</span>
                                </div>
                                {log.logType === "status_change" && log.oldStatus && log.newStatus && (
                                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full inline-block">
                                        {log.oldStatus} → {log.newStatus}
                                    </span>
                                )}
                                {log.comment && (
                                    <p className="text-sm text-gray-700 mt-1">{log.comment}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Formulaire d'ajout de note rapide */}
            <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ajouter une note..."
                    className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-indigo-400"
                    disabled={isPosting}
                />
                <button
                    onClick={handleSendNote}
                    disabled={isPosting || !comment.trim()}
                    className="shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors"
                >
                    {isPosting ? (
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    );
};