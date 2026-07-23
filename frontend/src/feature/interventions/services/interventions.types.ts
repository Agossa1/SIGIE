/**
 * Types frontend synchronisés avec le backend.
 * Source de vérité : apps/backend/src/modules/interventions/types/
 */

// ── Intervention ──────────────────────────────────────────────────────────

export interface Intervention {
    id: string;
    missionId: string;
    interventionType: string;
    status: string;
    userId?: string;
    teamId?: string;
    startedAt?: string;
    endedAt?: string;
    createdAt: string;
    updatedAt?: string;
    latitude?: number;
    longitude?: number;
    missionTitle?: string;
    completionPercentage?: number;
    teamName?: string;
    priority?: string;
    agentName?: string;
}

export type FieldAssignmentStatus = 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';

export interface CreateInterventionDTO {
    missionId: string;
    interventionType: string;
    userId?: string;
    priority?: string;
}

export interface UpdateInterventionDTO {
    status?: string;
    completionPercentage?: number;
    priority?: string;
    userId?: string;
}

export interface FieldInterventionReport {
    id: string;
    interventionId: string;
    workDone: string;
    createdAt: string;
}

export interface CreateInterventionReportDTO {
    interventionId?: string;
    report?: string;
    workDone: string;
    blockageRemovedPct?: number;
    finalConditionScore?: number;
    recommendations?: string;
    completed?: boolean;
    completionPercentage?: number;
    photosBefore?: string[];
    photosAfter?: string[];
}

// ── Stats ─────────────────────────────────────────────────────────────────

export interface InterventionStats {
    total: number;
    inProgress: number;
    completedToday: number;
    averageResolutionHours: number;
    byType: { type: string; count: number }[];
    byMunicipality: { municipalityId: string; municipalityName: string; count: number }[];
}

// ── Logs (Journal d'intervention) ─────────────────────────────────────────

export type InterventionLogType = 'status_change' | 'note' | 'blocker' | 'photo_added';

export interface InterventionLog {
    id: string;
    interventionId: string;
    authorId?: string;
    logType: InterventionLogType;
    oldStatus?: string;
    newStatus?: string;
    comment?: string;
    createdAt: string;
    authorName?: string;
    authorRole?: string;
}

export interface CreateInterventionLogDTO {
    logType: InterventionLogType;
    oldStatus?: string;
    newStatus?: string;
    comment?: string;
}