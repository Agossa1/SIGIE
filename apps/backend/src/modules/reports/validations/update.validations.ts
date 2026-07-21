import { z } from 'zod';
import { IssueCategory, PriorityLevel, RiskLevel, FieldReportStatus } from '../types/reports.types';

export const updateReportSchema = z.object({
    title: z.string().min(5).max(255).optional(),
    description: z.string().max(5000).optional(),
    issueCategory: z.nativeEnum(IssueCategory).optional(),
    priority: z.nativeEnum(PriorityLevel).optional(),
    riskLevel: z.nativeEnum(RiskLevel).optional(),
    status: z.nativeEnum(FieldReportStatus).optional(),
    assignedTo: z.string().uuid().optional(),
    resolvedAt: z.string().datetime().optional(),
    slaHours: z.number().int().min(1).max(720).optional(),
});

export type UpdateReportDTO = z.infer<typeof updateReportSchema>;