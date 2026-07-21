export enum PriorityLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
    EMERGENCY = 'emergency'
}

export enum MissionStatus {
    DRAFT = 'draft',
    PLANNED = 'planned',
    ASSIGNED = 'assigned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    VALIDATED = 'validated',
    CANCELLED = 'cancelled'
}

export enum MissionType {
    DRAIN_CLEANING = 'drain_cleaning',
    WASTE_COLLECTION = 'waste_collection',
    ROAD_REPAIR = 'road_repair',
    FLOOD_RESPONSE = 'flood_response',
    INSPECTION = 'inspection',
    EMERGENCY_RESPONSE = 'emergency_response',
    SANITATION = 'sanitation',
    MAINTENANCE = 'maintenance',
    REFORESTATION = 'reforestation',
    ECOLOGICAL_RESTORATION = 'ecological_restoration',
    BIODIVERSITY_SURVEY = 'biodiversity_survey'
}

export interface Mission {
    id: string;
    municipalityId?: string;
    municipalityName?: string;
    missionType: MissionType;
    priorityLevel: PriorityLevel;
    title: string;
    description?: string;
    assignedTeamId?: string;
    assignedTeamName?: string;
    status: MissionStatus;
    scheduledAt?: string;
    completedAt?: string;
    createdBy: string;
    createdAt: string;
    latitude?: number;
    longitude?: number;
    reportId?: string;
    dueDate?: string;
    estimatedHours?: number;
    actualHours?: number;
    isOverdue?: boolean;
}

export interface CreateMissionDTO {
    title: string;
    description?: string;
    missionType: MissionType;
    priorityLevel: PriorityLevel;
    municipalityId?: string;
    assignedTeamId?: string;
    scheduledAt?: string;
    createdBy?: string;
    latitude?: number;
    longitude?: number;
    reportId?: string;
    dueDate?: string;
    estimatedHours?: number;
}

export interface UpdateMissionDTO {
    title?: string;
    description?: string;
    missionType?: MissionType;
    priorityLevel?: PriorityLevel;
    municipalityId?: string;
    assignedTeamId?: string;
    scheduledAt?: string;
    status?: MissionStatus;
    latitude?: number;
    longitude?: number;
    dueDate?: string;
    estimatedHours?: number;
    actualHours?: number;
    reportId?: string;
}

export interface AssignMissionDTO {
    userIds: string[];
}

export interface CreateMissionReportDTO {
    report: string;
    completionPercentage?: number;
    photos?: string[];
}

export interface MissionAssignment {
    id: string;
    missionId: string;
    userId: string;
    assignedAt: string;
}

export interface MissionReport {
    id: string;
    missionId: string;
    submittedBy: string;
    report: string;
    completionPercentage?: number;
    photos?: string[];
    createdAt: string;
}

export interface MissionStatusLog {
    id: string;
    missionId: string;
    oldStatus: MissionStatus;
    newStatus: MissionStatus;
    changedBy: string;
    createdAt: string;
}

export interface MissionChecklist {
    id: string;
    missionId: string;
    label: string;
    done: boolean;
    doneBy?: string;
    doneAt?: string;
    createdAt: string;
    order: number;
}

export interface MissionDetails extends Mission {
    assignments: MissionAssignment[];
    reports: MissionReport[];
    statusLogs: MissionStatusLog[];
    checklist: MissionChecklist[];
}