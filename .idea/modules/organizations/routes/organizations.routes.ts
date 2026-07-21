import { Router } from 'express';
import { 
    createOrganizationController, 
    getOrganizationsController, 
    getOrganizationByIdController,
    updateOrganizationController,
    deleteOrganizationController
} from '../controllers/organizations.controller';
import { OrganizationRepository } from '../repositories/organization.repository';
import { CreateOrganizationService } from '../services/create.service';
import { GetOrganizationsService } from '../services/get.service';
import { UpdateOrganizationService } from '../services/update.service';
import { DeleteOrganizationService } from '../services/delete.service';
import PostgresDatabase from '../../../../apps/backend/src/infra/database/postgres';
import { createLogger, format, transports } from 'winston';
import { authMiddleware, requireRole } from '../../../../apps/backend/src/shared/middlewares/auth.middleware';

export const organizationsRouter = (db: PostgresDatabase) => {
    const router = Router();

    const logger = createLogger({
        format: format.simple(),
        transports: [new transports.Console()],
    });

    const repository = new OrganizationRepository(db, logger);
    const createService = new CreateOrganizationService(repository);
    const getService = new GetOrganizationsService(repository);
    const updateService = new UpdateOrganizationService(repository);
    const deleteService = new DeleteOrganizationService(repository);

    router.get('/', authMiddleware, getOrganizationsController(getService));
    
    router.get('/:id', authMiddleware, getOrganizationByIdController(getService));

    router.post(
        '/',
        authMiddleware,
        requireRole(['super_admin', 'platform_admin']),
        createOrganizationController(createService)
    );

    router.patch(
        '/:id',
        authMiddleware,
        requireRole(['super_admin', 'platform_admin']),
        updateOrganizationController(updateService)
    );

    router.delete(
        '/:id',
        authMiddleware,
        requireRole(['super_admin']),
        deleteOrganizationController(deleteService)
    );

    return router;
};
