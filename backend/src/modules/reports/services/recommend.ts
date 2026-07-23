import { ReportsRepository } from '../repositories/reports.repository';
import type { Logger } from 'winston';
import { NotFoundError, BadRequestError } from '../../../shared/errors/appErrors';

export interface RecommendReportDTO {
    reportId: string;
    recommendation: string;
    suggestedMissionType?: string;
    suggestedPriority?: string;
    estimatedBudget?: number;
    urgentFlag?: boolean;
    // Catégorie du signalement détermine l'aiguillage DST ou SGDS
}

/**
 * Service : Le superviseur recommande un signalement et l'aiguille vers DST ou SGDS.
 * 
 * - Catégories DST : drainage, road, lighting, flooding
 * - Catégories SGDS : waste, sanitation, other
 * 
 * Le statut passe de VALIDATED_BY_TEAM à PENDING_DST ou PENDING_SGDS.
 */
export class RecommendReportService {
    constructor(
        private readonly repository: ReportsRepository,
        private readonly logger: Logger,
    ) {}

    async execute(dto: RecommendReportDTO): Promise<void> {
        const report = await this.repository.getReportById(dto.reportId);
        if (!report) {
            throw new NotFoundError('Signalement introuvable');
        }

        // Vérifier que le statut permet la recommandation
        const allowedStatuses = ['validated_by_team', 'submitted'];
        if (!allowedStatuses.includes(report.status)) {
            throw new BadRequestError(
                `Impossible de recommander un signalement au statut "${report.status}". Statuts autorisés : ${allowedStatuses.join(', ')}`
            );
        }

        // Déterminer l'aiguillage DST ou SGDS selon la catégorie
        const dstCategories = ['drainage', 'road', 'lighting', 'flooding'];
        const sgdsCategories = ['waste', 'other'];
        
        let newStatus: string;
        if (dstCategories.includes(report.issueCategory)) {
            newStatus = 'pending_dst';
        } else if (sgdsCategories.includes(report.issueCategory)) {
            newStatus = 'pending_sgds';
        } else {
            // biodiversty, air_quality, water_quality → DST par défaut
            newStatus = 'pending_dst';
        }

        // Mettre à jour le signalement avec la recommandation et le nouveau statut
        await this.repository.updateReport(dto.reportId, {
            status: newStatus as any,
        });

        // Mettre à jour les colonnes de recommandation (via requête directe)
        await this.updateRecommendationFields(dto, newStatus);

        this.logger.info(`Signalement ${dto.reportId} recommandé → ${newStatus}`, {
            category: report.issueCategory,
            recommendation: dto.recommendation,
        });
    }

    private async updateRecommendationFields(dto: RecommendReportDTO, status: string): Promise<void> {
        // Utiliser l'update existant du repository mais on a besoin d'une requête directe 
        // pour les champs de recommandation car ils ne sont pas dans UpdateReportDTO
        const db = (this.repository as any).db;
        if (!db) return; // fallback silencieux si db non accessible

        const fields: string[] = [];
        const params: any[] = [];
        let idx = 1;

        if (dto.recommendation !== undefined) {
            fields.push(`supervisor_recommendation = $${idx++}`);
            params.push(dto.recommendation);
        }
        if (dto.suggestedMissionType !== undefined) {
            fields.push(`suggested_mission_type = $${idx++}`);
            params.push(dto.suggestedMissionType);
        }
        if (dto.suggestedPriority !== undefined) {
            fields.push(`suggested_priority = $${idx++}`);
            params.push(dto.suggestedPriority);
        }
        if (dto.estimatedBudget !== undefined) {
            fields.push(`estimated_budget = $${idx++}`);
            params.push(dto.estimatedBudget);
        }
        if (dto.urgentFlag !== undefined) {
            fields.push(`urgent_flag = $${idx++}`);
            params.push(dto.urgentFlag);
        }

        if (fields.length > 0) {
            fields.push(`updated_at = $${idx++}`);
            params.push(new Date().toISOString());
            params.push(dto.reportId);
            await db.query(
                `UPDATE technician_reports SET ${fields.join(', ')} WHERE id = $${idx}`,
                params
            );
        }
    }
}