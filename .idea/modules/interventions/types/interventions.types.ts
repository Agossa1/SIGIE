export enum FieldAssignmentStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

export interface Intervention {
    id: string;
    missionId: string;
    interventionType: string;
    status: FieldAssignmentStatus;
    startedAt?: string;
    endedAt?: string;
    createdAt: string;
    latitude?: number;
    longitude?: number;
}

export interface FieldInterventionReport {
    id: string;
    interventionId: string;
    reportId?: string;
    createdBy: string;
    workDone: string;
    blockageRemovedPct?: number;
    finalConditionScore?: number;
    recommendations?: string;
    completed: boolean;
    createdAt: string;
}

export interface CreateInterventionDTO {
    missionId: string;
    interventionType: string;
}

export interface UpdateInterventionStatusDTO {
    status: FieldAssignmentStatus;
}

export interface CreateInterventionReportDTO {
    reportId?: string;
    workDone: string;
    blockageRemovedPct?: number;
    finalConditionScore?: number;
    recommendations?: string;
    completed?: boolean;
}
