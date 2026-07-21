import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { fetchMissionById, updateMissionStatus, addMissionReport, assignMission, addChecklistItem, toggleChecklistItem, deleteChecklistItem } from "../services/missions.thunk";
import { selectCurrentMission, selectMissionsLoading } from "../services/missions.selectors";
import { MissionStatus } from "../services/missions.types";
import { fetchUsers } from "../../users/services/users.thunk";
import { selectAllUsers } from "../../users/services/users.selectors";
import { selectAllReports } from "../../reports/services/reports.selectors";
import { StatusBadge } from "../../reports/components/StatusBadge";

interface MissionDetailsModalProps {
  missionId: string;
  onClose: () => void;
  onRefresh: () => void;
}

export const MissionDetailsModal: React.FC<MissionDetailsModalProps> = ({ missionId, onClose, onRefresh }) => {
  const dispatch = useAppDispatch();
  const mission = useAppSelector(selectCurrentMission);
  const loading = useAppSelector(selectMissionsLoading);
  const allReports = useAppSelector(selectAllReports);
  
  const [activeTab, setActiveTab] = useState<"details" | "reports" | "checklist">("details");
  const [reportText, setReportText] = useState("");
  const [newChecklistLabel, setNewChecklistLabel] = useState("");
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState(false);
  const users = useAppSelector(selectAllUsers);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  useEffect(() => {
    if (missionId) {
      dispatch(fetchMissionById(missionId));
    }
  }, [dispatch, missionId]);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleStatusChange = async (newStatus: MissionStatus) => {
    try {
      await dispatch(updateMissionStatus({ id: missionId, status: newStatus })).unwrap();
      dispatch(fetchMissionById(missionId));
      onRefresh();
    } catch (err: any) {
      if (err?.errors?.hasActiveInterventions) {
        if (window.confirm("Des interventions sont toujours en cours sur cette mission.\\n\\nVoulez-vous toutes les clôturer automatiquement pour pouvoir terminer la mission ?")) {
          try {
            await dispatch(updateMissionStatus({ id: missionId, status: newStatus, forceCompleteInterventions: true })).unwrap();
            dispatch(fetchMissionById(missionId));
            onRefresh();
          } catch (e: any) {
            console.error("Failed to force update status", e);
            alert(e?.message || "Erreur lors de la mise à jour du statut");
          }
        }
      } else {
        console.error("Failed to update status", err);
        alert(err?.message || "Erreur lors de la mise à jour du statut");
      }
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUserId) return;
    try {
      await dispatch(assignMission({ id: missionId, data: { userIds: [selectedUserId] } })).unwrap();
      setSelectedUserId("");
      dispatch(fetchMissionById(missionId));
    } catch (err) {
      console.error("Failed to assign user", err);
    }
  };

  const handleAddReport = async () => {
    if (!reportText) return;
    // Photo obligatoire quand l'avancement est à 100%
    if (completionPercentage === 100 && !photoBase64) {
      setPhotoError(true);
      return;
    }
    setPhotoError(false);
    try {
      await dispatch(addMissionReport({ 
        id: missionId, 
        data: { 
          report: reportText, 
          completionPercentage: completionPercentage > 0 ? completionPercentage : undefined,
          photos: photoBase64 ? [photoBase64] : undefined,
        } 
      })).unwrap();
      setReportText("");
      setCompletionPercentage(0);
      setPhotoBase64(null);
      setPhotoError(false);
      dispatch(fetchMissionById(missionId));
    } catch (err) {
      console.error("Failed to add report", err);
    }
  };

  const handleAddChecklistItem = async () => {
    if (!newChecklistLabel.trim()) return;
    try {
      await dispatch(addChecklistItem({ id: missionId, label: newChecklistLabel, order: (mission?.checklist?.length || 0) })).unwrap();
      setNewChecklistLabel("");
      dispatch(fetchMissionById(missionId));
    } catch (err) { console.error(err); }
  };

  const handleToggleChecklistItem = async (itemId: string) => {
    try {
      await dispatch(toggleChecklistItem({ id: missionId, itemId })).unwrap();
      dispatch(fetchMissionById(missionId));
    } catch (err) { console.error(err); }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    if (!confirm("Supprimer cet élément ?")) return;
    try {
      await dispatch(deleteChecklistItem({ id: missionId, itemId })).unwrap();
      dispatch(fetchMissionById(missionId));
    } catch (err) { console.error(err); }
  };


  if (loading && !mission) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-2xl text-center">
          <div className="w-6 h-6 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Chargement de la mission...</p>
        </div>
      </div>
    );
  }

  if (!mission) {
    return null;
  }

  const assignedUserIds = mission.assignments?.map(a => a.userId) || [];
  const unassignedUsers = users.filter(u => !assignedUserIds.includes(u.id));

  // Signalement source lié à cette mission
  const linkedReport = mission.reportId ? allReports.find(r => r.id === mission.reportId) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-medium text-gray-900">{mission.title}</h2>
            <p className="text-sm text-gray-500 mt-1">ID: {mission.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          <button 
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "details" ? "border-emerald-500 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("details")}
          >
            Détails & Actions
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "reports" ? "border-emerald-500 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("reports")}
          >
            Rapports ({mission.reports?.length || 0})
          </button>
          <button 
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "checklist" ? "border-emerald-500 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("checklist")}
          >
            Checklist ({mission.checklist?.filter(c => c.done).length || 0}/{mission.checklist?.length || 0})
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-white">
          
          {activeTab === "details" && (
            <div className="space-y-6">
              
              {/* Signalement source */}
              {linkedReport && (
                <div className="flex items-center gap-3 bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500">Signalement source</p>
                    <p className="text-sm font-medium text-gray-900 truncate mt-0.5">{linkedReport.title}</p>
                  </div>
                  <StatusBadge status={linkedReport.status} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Informations Générales</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <div>
                      <div className="text-sm font-medium text-gray-500">Type de mission</div>
                      <div className="text-sm font-medium text-gray-900">{mission.missionType.replace(/_/g, ' ')}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Priorité</div>
                      <div className={`text-sm font-medium ${['high', 'critical', 'emergency'].includes(mission.priorityLevel) ? 'text-red-600' : 'text-gray-700'}`}>
                        {mission.priorityLevel}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Description</div>
                      <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{mission.description || "Aucune description fournie."}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">Créée le</div>
                      <div className="text-sm text-gray-700">{new Date(mission.createdAt).toLocaleString("fr-FR")}</div>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-400 mt-6 mb-2">Assignation Utilisateurs</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-1">Ajouter un agent</label>
                      <div className="flex gap-2">
                        <select 
                          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                          value={selectedUserId}
                          onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                          <option value="">-- Sélectionner --</option>
                          {unassignedUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.roles.join(', ')})</option>
                          ))}
                        </select>
                        <button
                          onClick={handleAssignUser}
                          disabled={!selectedUserId}
                          className="px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50"
                        >
                          Assigner
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500 block mb-2">Agents Assignés ({mission.assignments?.length || 0})</label>
                      <div className="space-y-2">
                        {mission.assignments && mission.assignments.length > 0 ? (
                          mission.assignments.map(assign => {
                            const user = users.find(u => u.id === assign.userId);
                            return (
                              <div key={assign.id} className="flex justify-between items-center bg-white border border-gray-100 px-3 py-2 rounded-lg">
                                <div className="text-sm font-medium text-gray-900">
                                  {user ? `${user.firstName} ${user.lastName}` : `Utilisateur #${assign.userId.substring(0, 8)}`}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {new Date(assign.assignedAt).toLocaleDateString("fr-FR")}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-sm text-gray-500">Aucun agent assigné.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Statut & Équipe</h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Changer le statut</label>
                        <select 
                          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                          value={mission.status}
                          onChange={(e) => handleStatusChange(e.target.value as MissionStatus)}
                        >
                          {Object.values(MissionStatus).map(status => (
                            <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-1">Équipe assignée</label>
                        {mission.assignedTeamName ? (
                           <div className="text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                             {mission.assignedTeamName}
                           </div>
                        ) : (
                          <div className="text-sm font-medium text-gray-500">Aucune équipe assignée globalement</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Historique des statuts</h3>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 max-h-[150px] overflow-y-auto">
                      {mission.statusLogs && mission.statusLogs.length > 0 ? (
                        mission.statusLogs.map(log => (
                          <div key={log.id} className="flex justify-between items-center border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                            <div className="text-sm text-gray-600">
                              <span className="font-bold">{log.oldStatus}</span> &rarr; <span className="font-bold">{log.newStatus}</span>
                            </div>
                            <div className="text-sm text-gray-400">
                              {new Date(log.createdAt).toLocaleDateString("fr-FR")}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-gray-400">Aucun historique disponible</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6 flex flex-col h-full">
              
              <div className="flex-1 overflow-y-auto space-y-4">
                {mission.reports && mission.reports.length > 0 ? (
                  mission.reports.map(report => (
                    <div key={report.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-gray-900">{report.submittedBy}</div>
                        <div className="text-sm font-medium text-gray-400">
                          {new Date(report.createdAt).toLocaleString("fr-FR")}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.report}</p>
                      {report.completionPercentage !== undefined && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="text-sm font-medium text-gray-500">Avancement :</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-emerald-500 h-full rounded-full" 
                              style={{ width: `${report.completionPercentage}%` }}
                            />
                          </div>
                          <div className="text-sm font-medium text-emerald-600">{report.completionPercentage}%</div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-sm text-gray-400 font-medium">Aucun rapport soumis pour le moment.</div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 mt-auto">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Nouveau Rapport</h4>
                <textarea 
                  placeholder="Décrivez l'avancement ou les problèmes rencontrés..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-y min-h-[80px]"
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                />
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-600">Progression globale :</label>
                  <input 
                    type="number" 
                    min="0" max="100" 
                    className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                    value={completionPercentage}
                    onChange={(e) => setCompletionPercentage(Number(e.target.value))}
                  />
                  <span className="text-sm font-medium text-gray-500">%</span>
                </div>

                {/* Zone photo — obligatoire à 100% */}
                <div className="mt-3">
                  <label className={`block text-sm font-medium mb-1 ${
                    completionPercentage === 100 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    Preuve photo{completionPercentage === 100 ? ' (obligatoire pour clôturer)' : ' (optionnel)'}
                  </label>
                  {photoBase64 ? (
                    <div className="relative">
                      <img 
                        src={photoBase64} 
                        alt="Preuve terrain" 
                        className="w-full max-h-40 object-cover rounded-lg border border-gray-200"
                      />
                      <button 
                        onClick={() => setPhotoBase64(null)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                        title="Supprimer la photo"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className={`flex items-center gap-2 border-2 border-dashed rounded-lg p-3 cursor-pointer transition-colors ${
                      photoError 
                        ? 'border-red-400 bg-red-50' 
                        : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50'
                    }`}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            setPhotoBase64(reader.result as string);
                            setPhotoError(false);
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      <svg className={`w-5 h-5 ${ photoError ? 'text-red-400' : 'text-gray-400' }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className={`text-sm ${ photoError ? 'text-red-500 font-medium' : 'text-gray-500' }`}>
                        {photoError ? '⚠️ Photo obligatoire pour clôturer la mission' : 'Prendre / choisir une photo'}
                      </span>
                    </label>
                  )}
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleAddReport}
                    disabled={!reportText.trim()}
                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Soumettre le rapport
                  </button>
                </div>
              </div>

            </div>
          )}

          {activeTab === "checklist" && (
            <div className="space-y-6 flex flex-col h-full">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nouvelle tâche..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-emerald-500"
                    value={newChecklistLabel}
                    onChange={(e) => setNewChecklistLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  />
                  <button
                    onClick={handleAddChecklistItem}
                    disabled={!newChecklistLabel.trim()}
                    className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {mission.checklist && mission.checklist.length > 0 ? (
                  mission.checklist.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => handleToggleChecklistItem(item.id)}
                        className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div className={`flex-1 text-sm ${item.done ? "text-gray-400 line-through" : "text-gray-700"}`}>
                        {item.label}
                      </div>
                      <button
                        onClick={() => handleDeleteChecklistItem(item.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-sm text-gray-400 font-medium">Aucune tâche dans la checklist.</div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
