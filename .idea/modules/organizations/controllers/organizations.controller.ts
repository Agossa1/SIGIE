import { Request, Response, NextFunction } from 'express';
import { CreateOrganizationService } from '../services/create.service';
import { GetOrganizationsService } from '../services/get.service';
import { UpdateOrganizationService } from '../services/update.service';
import { DeleteOrganizationService } from '../services/delete.service';
import { CreateOrganizationDTO, UpdateOrganizationDTO } from '../types/organization.types';

export const createOrganizationController = (service: CreateOrganizationService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dto: CreateOrganizationDTO = req.body;
            const id = await service.execute(dto);
            res.status(201).json({ success: true, data: { id }, message: 'Organisation créée avec succès' });
        } catch (error) {
            next(error);
        }
    };
};

export const getOrganizationsController = (service: GetOrganizationsService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const organizations = await service.executeAll();
            res.status(200).json({ success: true, data: organizations, message: 'Organisations récupérées' });
        } catch (error) {
            next(error);
        }
    };
};

export const getOrganizationByIdController = (service: GetOrganizationsService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const organization = await service.executeById(id);
            res.status(200).json({ success: true, data: organization, message: 'Détails de l\'organisation' });
        } catch (error) {
            next(error);
        }
    };
};

export const updateOrganizationController = (service: UpdateOrganizationService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            const dto: UpdateOrganizationDTO = req.body;
            await service.execute(id, dto);
            res.status(200).json({ success: true, data: null, message: 'Organisation mise à jour' });
        } catch (error) {
            next(error);
        }
    };
};

export const deleteOrganizationController = (service: DeleteOrganizationService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;
            await service.execute(id);
            res.status(200).json({ success: true, data: null, message: 'Organisation supprimée' });
        } catch (error) {
            next(error);
        }
    };
};
