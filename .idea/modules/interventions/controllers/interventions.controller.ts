import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { CreateInterventionService } from '../services/create.service';
import { GetInterventionsByMissionService } from '../services/get-by-mission.service';
import { GetInterventionsByTeamService } from '../services/get-by-team.service';
import { UpdateInterventionStatusService } from '../services/update-status.service';
import { AddInterventionReportService } from '../services/report.service';
import { ValidationError, UnauthorizedError } from '../../../../apps/backend/src/shared/errors/appErrors';
import {
    createInterventionSchema,
    updateInterventionStatusSchema,
    createInterventionReportSchema,
    interventionIdParamSchema,
    missionIdParamSchema
} from '../validations/interventions.validations';

export const createInterventionController = (service: CreateInterventionService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const validated = createInterventionSchema.parse(req.body);
            const id = await service.execute(validated as any);
            res.status(201).json({ success: true, data: { id }, message: 'Intervention créée avec succès' });
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new ValidationError('Données d\'intervention invalides', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};

export const getInterventionsByMissionController = (service: GetInterventionsByMissionService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { missionId } = missionIdParamSchema.parse(req.params);
            const interventions = await service.execute(missionId);
            res.status(200).json({ success: true, data: interventions, message: 'Interventions récupérées' });
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new ValidationError('ID de mission invalide', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};

export const getInterventionsByTeamController = (service: GetInterventionsByTeamService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = (req as any).user;
            if (!user || !user.id) {
                throw new UnauthorizedError('Utilisateur non authentifié');
            }
            const interventions = await service.execute(user.id, user.roles);
            res.status(200).json({ success: true, data: interventions, message: 'Interventions récupérées' });
        } catch (error) {
            next(error);
        }
    };
};

export const updateInterventionStatusController = (service: UpdateInterventionStatusService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = interventionIdParamSchema.parse(req.params);
            const { status } = updateInterventionStatusSchema.parse(req.body);
            await service.execute(id, status);
            res.status(200).json({ success: true, data: null, message: 'Statut de l\'intervention mis à jour' });
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new ValidationError('Données de mise à jour invalides', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};

export const addInterventionReportController = (service: AddInterventionReportService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = interventionIdParamSchema.parse(req.params);
            const validated = createInterventionReportSchema.parse(req.body);
            const user = (req as any).user;
            if (!user || !user.id) {
                throw new UnauthorizedError('Utilisateur non authentifié');
            }
            const userId = user.id;
            const reportId = await service.execute(id, userId, validated as any);
            res.status(201).json({ success: true, data: { id: reportId }, message: 'Rapport d\'intervention créé avec succès' });
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new ValidationError('Données de rapport invalides', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};
