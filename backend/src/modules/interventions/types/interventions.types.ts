export interface Intervention {
    id: string;
    missionId: string;
    reportId?: string;
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
    teamName?: string;
    completionPercentage?: number;
    photosBefore?: string[];
    photosAfter?: string[];
    actualHours?: number;
    materialUsed?: string[];
    priority?: string;
}

export interface CreateInterventionDTO {
    missionId: string;
    interventionType: string;
    reportId?: string;
    priority?: string;
    userId?: string;
}

export interface UpdateInterventionDTO {
    status?: string;
    completionPercentage?: number;
    endedAt?: string;
    actualHours?: number;
    priority?: string;
    userId?: string;
}

export interface InterventionStats {
    total: number;
    inProgress: number;
    completedToday: number;
    averageResolutionHours: number;
    byType: { type: string; count: number }[];
    byMunicipality: { municipalityId: string; municipalityName: string; count: number }[];
}

export interface TraceabilityChain {
    report: {
        id: string;
        title: string;
        category: string;
        status: string;
        priority: string;
        reportedAt: string;
        municipalityName?: string;
    } | null;
    missions: Array<{
        id: string;
        title: string;
        status: string;
        scheduledAt?: string;
        completedAt?: string;
        teamName?: string;
    }>;
    interventions: Array<{
        id: string;
        type: string;
        status: string;
        startedAt?: string;
        endedAt?: string;
        completionPercentage?: number;
        teamName?: string;
    }>;
}

export interface InterventionRecord {
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
    teamName?: string;
    priority?: string;
    completionPercentage?: number;
}

export interface StatsRecord {
    total: number;
    inProgress: number;
    completedToday: number;
    averageResolutionHours: number;
}

export interface TypeStatRecord {
    type: string;
    count: number;
}

export interface MunicipalityStatRecord {
    municipalityId: string;
    municipalityName: string;
    count: number;
}

export interface TraceabilityReportRecord {
    id: string;
    title: string;
    category: string;
    status: string;
    priority: string;
    reportedAt: string;
    municipalityName?: string;
}

export interface TraceabilityMissionRecord {
    id: string;
    title: string;
    status: string;
    scheduledAt?: string;
    completedAt?: string;
    teamName?: string;
}

export interface TraceabilityInterventionRecord {
    id: string;
    type: string;
    status: string;
    startedAt?: string;
    endedAt?: string;
    teamName?: string;
}

export interface ExportRecord {
    id: string;
    type: string;
    status: string;
    startedAt: string;
    endedAt: string;
    missionTitle: string;
    municipalityName: string;
    agentName: string;
}
