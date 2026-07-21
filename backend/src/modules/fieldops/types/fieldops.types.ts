export interface MissionStats {
    active: number;
    planned: number;
    completedToday: number;
    total: number;
}

export interface ReportStats {
    pending: number;
    resolved: number;
    critical: number;
    total: number;
}

export interface InterventionStats {
    active: number;
    total: number;
}

export interface TeamStats {
    active: number;
    total: number;
}

export interface FieldOpsSummary {
    missions: MissionStats;
    reports: ReportStats;
    interventions: InterventionStats;
    teams: TeamStats;
}