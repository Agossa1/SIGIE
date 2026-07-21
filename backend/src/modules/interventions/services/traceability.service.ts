import {   type TraceabilityReportRecord, type TraceabilityMissionRecord, type TraceabilityInterventionRecord } from '../types/interventions.types';
import { InterventionsRepository } from '../repositories/interventions.repository';

export interface TraceabilityChain {
    report: TraceabilityReportRecord | null;
    missions: TraceabilityMissionRecord[];
    interventions: TraceabilityInterventionRecord[];
}

export class InterventionsTraceabilityService {
    constructor(private readonly repository: InterventionsRepository) {}

    async getTraceabilityByReport(reportId: string): Promise<TraceabilityChain> {
        return this.repository.getTraceabilityByReport(reportId);
    }
}