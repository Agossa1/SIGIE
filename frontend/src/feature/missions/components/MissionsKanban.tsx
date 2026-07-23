import React, { useState } from 'react';
import { Pen, User } from 'lucide-react';
import type { Mission } from '../services/missions.types';
import { MissionStatus } from '../services/missions.types';

interface MissionsKanbanProps {
  missions: Mission[];
  onStatusChange: (missionId: string, newStatus: MissionStatus) => void;
  onMissionClick: (missionId: string) => void;
  isReadOnly?: boolean;
}

const COLUMNS = [
  { id: MissionStatus.DRAFT, title: 'Brouillon', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  { id: MissionStatus.ASSIGNED, title: 'Assignées', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' },
  { id: MissionStatus.IN_PROGRESS, title: 'En cours', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { id: MissionStatus.COMPLETED, title: 'Terminées', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { id: MissionStatus.VALIDATED, title: 'Validées', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-300' },
];

export const MissionsKanban: React.FC<MissionsKanbanProps> = ({
  missions,
  onStatusChange,
  onMissionClick,
  isReadOnly = false
}) => {
  const [draggedMissionId, setDraggedMissionId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, missionId: string) => {
    if (isReadOnly) {
      e.preventDefault();
      return;
    }
    setDraggedMissionId(missionId);
    e.dataTransfer.setData('text/plain', missionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: MissionStatus) => {
    e.preventDefault();
    const missionId = e.dataTransfer.getData('text/plain');
    if (missionId && missionId === draggedMissionId) {
      const mission = missions.find(m => m.id === missionId);
      if (mission && mission.status !== status) {
        onStatusChange(missionId, status);
      }
    }
    setDraggedMissionId(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 items-start min-h-[60vh]">
      {COLUMNS.map(column => {
        const columnMissions = missions.filter(m => m.status === column.id);
        
        return (
          <div 
            key={column.id} 
            className={`flex flex-col w-80 shrink-0 rounded-xl border ${column.borderColor} ${column.bgColor} overflow-hidden`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="p-3 border-b border-black/5 bg-white/50 backdrop-blur-sm flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">{column.title}</h3>
              <span className="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full shadow-sm">
                {columnMissions.length}
              </span>
            </div>
            
            <div className="p-3 flex flex-col gap-3 min-h-[150px]">
              {columnMissions.map(mission => (
                <div
                  key={mission.id}
                  draggable={!isReadOnly}
                  onDragStart={(e) => handleDragStart(e, mission.id)}
                  onClick={() => onMissionClick(mission.id)}
                  className={`bg-white p-3 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all ${draggedMissionId === mission.id ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getPriorityColor(mission.priorityLevel)}`}>
                      {mission.priorityLevel}
                    </span>
                    {mission.isOverdue && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded border bg-red-100 text-red-700 border-red-200 whitespace-nowrap">
                        En retard
                      </span>
                    )}
                  </div>
                  
                  <h4 className="font-semibold text-sm text-gray-900 leading-tight mb-1">
                    {mission.title}
                  </h4>
                  
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                    {mission.description || 'Aucune description'}
                  </p>
                  
                  <div className="flex flex-col gap-1.5 mt-auto pt-2 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400 shrink-0 flex items-center gap-1.5"><Pen className="w-3.5 h-3.5" /> Créée par:</span>
                      <span className="text-gray-700 font-medium truncate" title={(mission as any).creatorName || mission.createdBy}>
                        {(mission as any).creatorName || mission.createdBy || 'Système'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-gray-400 shrink-0 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Assignée à:</span>
                        <span className="text-gray-700 font-medium truncate" title={mission.assignedTeamName}>
                          {mission.assignedTeamName || 'Non assignée'}
                        </span>
                      </div>
                      {mission.dueDate && (
                        <span className={`text-[10px] font-medium shrink-0 ${mission.isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                          {new Date(mission.dueDate).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {columnMissions.length === 0 && (
                <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-sm font-medium">
                  Glisser ici
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
