import PostgresDatabase from '../../infra/database/postgres';
import { createLogger, format, transports } from 'winston';
import { MissionsRepository } from './repositories/missions.repository';
import { CreateMissionService } from './services/create.service';
import { GetMissionsService } from './services/get.service';
import { UpdateMissionService } from './services/update.service';
import { GetMissionByIdService } from './services/get-by-id.service';
import { AssignMissionService } from './services/assign.service';
import { AddMissionReportService } from './services/report.service';
import { CreateMissionFromReportService } from './services/create-from-report.service';
import { ValidateMissionService } from './services/validate-mission.service';
import { CreateMissionController } from './controllers/create-mission.controller';
import { GetMissionsController } from './controllers/get-missions.controller';
import { GetMissionByIdController } from './controllers/get-mission-by-id.controller';
import { UpdateMissionController } from './controllers/update-mission.controller';
import { UpdateMissionStatusController } from './controllers/update-mission-status.controller';
import { AssignMissionController } from './controllers/assign-mission.controller';
import { AddMissionReportController } from './controllers/add-mission-report.controller';
import { CreateMissionFromReportController } from './controllers/create-mission-from-report.controller';
import { ValidateMissionController } from './controllers/validate-mission.controller';

/**
 * Module Missions — Point d'entrée avec injection de dépendances centralisée.
 * 7 contrôleurs, 6 services, 1 repository.
 * Pattern 1-fichier = 1-classe respecté.
 */
export class MissionsModule {
    public readonly repository: MissionsRepository;
    public readonly services: {
        create: { service: CreateMissionService; controller: CreateMissionController };
        get: { service: GetMissionsService; controller: GetMissionsController };
        update: { service: UpdateMissionService; controller: UpdateMissionController };
        updateStatus: { service: UpdateMissionService; controller: UpdateMissionStatusController };
        getById: { service: GetMissionByIdService; controller: GetMissionByIdController };
        assign: { service: AssignMissionService; controller: AssignMissionController };
        report: { service: AddMissionReportService; controller: AddMissionReportController };
        fromReport: { service: CreateMissionFromReportService; controller: CreateMissionFromReportController };
        validate: { service: ValidateMissionService; controller: ValidateMissionController };
    };

    constructor(db: PostgresDatabase) {
        const logger = createLogger({
            format: format.simple(),
            transports: [new transports.Console()],
        });

        this.repository = new MissionsRepository(db, logger);

        // Services (sans SQL direct — utilisent le repository)
        const createService = new CreateMissionService(this.repository);
        const getService = new GetMissionsService(this.repository);
        const updateService = new UpdateMissionService(this.repository, db);
        const getByIdService = new GetMissionByIdService(this.repository);
        const assignService = new AssignMissionService(this.repository);
        const reportService = new AddMissionReportService(this.repository);
        const fromReportService = new CreateMissionFromReportService(this.repository);
        const validateService = new ValidateMissionService(this.repository, logger);

        // Contrôleurs (1 classe = 1 fichier)
        this.services = {
            create: { service: createService, controller: new CreateMissionController(createService) },
            get: { service: getService, controller: new GetMissionsController(getService) },
            update: { service: updateService, controller: new UpdateMissionController(updateService) },
            updateStatus: { service: updateService, controller: new UpdateMissionStatusController(updateService) },
            getById: { service: getByIdService, controller: new GetMissionByIdController(getByIdService) },
            assign: { service: assignService, controller: new AssignMissionController(assignService) },
            report: { service: reportService, controller: new AddMissionReportController(reportService) },
            fromReport: { service: fromReportService, controller: new CreateMissionFromReportController(fromReportService) },
            validate: { service: validateService, controller: new ValidateMissionController(validateService) },
        };
    }
}