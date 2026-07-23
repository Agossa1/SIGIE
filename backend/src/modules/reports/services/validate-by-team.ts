import { ReportsRepository } from '../repositories/reports.repository';
import type { Logger } from 'winston';
import { NotFoundError, BadRequestError } from '../../../shared/errors/appErrors';
import { FieldReportStatus } from '../types/reports.types';

export interface ValidateByTeamDTO {
    reportId: string;
    action: 'validate' | 'reject' | 'request_revision';
    comment?: string;
    validatedBy: string;
}

/**
 * Service : Le chef de brigade valide, rejette ou demande une correction.
 * 
 * Transition de statuts :
 *   validate          → SUBMITTED → VALIDATED_BY_TEAM
 *   reject            → SUBMITTED → REJECTED
 *   request_revision  → SUBMITTED → NEEDS_REVISION
 */
export class ValidateByTeamService {
    constructor(
        private readonly repository: ReportsRepository,
        private readonly logger: Logger,
    ) {}

    async execute(dto: ValidateByTeamDTO): Promise<void> {
        const report = await this.repository.getReportById(dto.reportId);
        if (!report) {
            throw new NotFoundError('Signalement introuvable');
        }

        // Seuls les signalements SUBMITTED peuvent être validés/rejetés
        if (report.status !== FieldReportStatus.SUBMITTED) {
            throw new BadRequestError(
                `Seuls les signalements au statut "submitted" peuvent être traités. Statut actuel : "${report.status}"`
            );
        }

        let newStatus: FieldReportStatus;
        let actionLabel: string;

        switch (dto.action) {
            case 'validate':
                newStatus = FieldReportStatus.VALIDATED_BY_TEAM;
                actionLabel = 'validé';
                break;
            case 'reject':
                newStatus = FieldReportStatus.REJECTED;
                actionLabel = 'rejeté';
                break;
            case 'request_revision':
                newStatus = FieldReportStatus.NEEDS_REVISION;
                actionLabel = 'renvoyé pour correction';
                break;
            default:
                throw new BadRequestError(`Action invalide : "${dto.action}". Utiliser : validate, reject, request_revision`);
        }

        // Mettre à jour le statut
        await this.repository.updateReport(dto.reportId, {
            status: newStatus,
        });

        // Ajouter un commentaire si fourni
        if (dto.comment) {
            await this.repository.addComment(dto.reportId, dto.validatedBy, {
                body: `[${actionLabel}] ${dto.comment}`,
                isInternal: true,
            });
        }

        this.logger.info(`Signalement ${dto.reportId} ${actionLabel} par le chef d'équipe`, {
            action: dto.action,
            newStatus,
        });
    }
}