import { api } from '../../../lib/apiClient';

export interface AnalyticsSummary {
    reports: {
        active: number;
        resolved: number;
        pendingTriage: number;
        total: number;
        slaBreached: number;
        avgResolutionHours: number | null;
        byCategory: {
            drainage: number;
            waste: number;
            road: number;
            flooding: number;
        };
    };
    missions: {
        inProgress: number;
        completed: number;
        validated: number;
        draft: number;
        overdue: number;
        total: number;
        avgActualHours: number | null;
        avgEstimatedHours: number | null;
    };
    interventions: {
        total: number;
        completed: number;
        avgDurationHours: number | null;
        avgConditionScore: number | null;
    };
    teams: {
        total: number;
        active: number;
        totalMembers: number;
    };
}

export const analyticsApi = {
    getSummary: async (): Promise<AnalyticsSummary> => {
        const res = await api.get<{ success: boolean; data: AnalyticsSummary }>('/analytics/summary');
        return res.data;
    }
};
