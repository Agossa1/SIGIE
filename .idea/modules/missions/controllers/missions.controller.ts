import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { CreateMissionService } from '../services/create.service';
import { GetMissionsService } from '../services/get.service';
import { UpdateMissionService } from '../services/update.service';
import { GetMissionByIdService } from '../services/get-by-id.service';
import { AssignMissionService } from '../services/assign.service';
import { AddMissionReportService } from '../services/report.service';
import { ValidationError, UnauthorizedError } from '../../../../apps/backend/src/shared/errors/appErrors';
import {
    createMissionSchema,
    updateMissionSchema,
    assignMissionSchema,
    createMissionReportSchema,
    missionIdParamSchema,
    updateMissionStatusSchema
} from '../validations/missions.validations';

export const createMissionController = (service: CreateMissionService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const validated = createMissionSchema.parse(req.body);
            const user = (req as any).user;
            if (!user || !user.id) {
                throw new UnauthorizedError('Utilisateur non authentifié');
            }
            const userId = user.id;
            const id = await service.execute(validated as any, userId);
            res.status(201).json({ success: true, data: { id }, message: 'Mission créée avec succès' });
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new ValidationError('Données de mission invalides', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};

export const getMissionsController = (service: GetMissionsService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const user = (req as any).user;
            if (!user || !user.id) {
                throw new UnauthorizedError('Utilisateur non authentifié');
            }
            const missions = await service.execute(user.id, user.roles);
            res.status(200).json({ success: true, data: missions, message: 'Missions récupérées' });
        } catch (error) {
            next(error);
        }
    };
};

export const getMissionByIdController = (service: GetMissionByIdService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = missionIdParamSchema.parse(req.params);
            const mission = await service.execute(id);
            res.status(200).json({ success: true, data: mission, message: 'Détails de la mission' });
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new ValidationError('ID de mission invalide', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};

export const updateMissionController = (service: UpdateMissionService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = missionIdParamSchema.parse(req.params);
            const validated = updateMissionSchema.parse(req.body);
            await service.executeUpdate(id, validated as any);
            res.status(200).json({ success: true, data: null, message: 'Mission mise à jour' });
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new ValidationError('Données de mise à jour invalides', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};

export const updateMissionStatusController = (service: UpdateMissionService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = missionIdParamSchema.parse(req.params);
            const { status } = updateMissionStatusSchema.parse(req.body);
            const user = (req as any).user;
            if (!user || !user.id) {
                throw new UnauthorizedError('Utilisateur non authentifié');
            }
            const userId = user.id;
            await service.executeStatus(id, status, userId);
            res.status(200).json({ success: true, data: null, message: 'Statut de la mission mis à jour' });
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new ValidationError('Statut de mission invalide', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};

export const assignMissionController = (service: AssignMissionService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = missionIdParamSchema.parse(req.params);
            const validated = assignMissionSchema.parse(req.body);
            await service.execute(id, validated);
            res.status(200).json({ success: true, data: null, message: 'Utilisateurs assignés à la mission' });
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new ValidationError('Données d\'assignation invalides', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};

export const addMissionReportController = (service: AddMissionReportService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = missionIdParamSchema.parse(req.params);
            const validated = createMissionReportSchema.parse(req.body);
            const user = (req as any).user;
            if (!user || !user.id) {
                throw new UnauthorizedError('Utilisateur non authentifié');
            }
            const userId = user.id;
            await service.execute(id, userId, validated as any);
            res.status(201).json({ success: true, data: null, message: 'Rapport ajouté avec succès' });
        } catch (error) {
            if (error instanceof ZodError) {
                return next(new ValidationError('Données de rapport invalides', error.flatten().fieldErrors));
            }
            next(error);
        }
    };
};
