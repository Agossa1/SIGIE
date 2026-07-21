import PostgresDatabase from '../../infra/database/postgres';
import { Logger } from 'winston';
import { RolesRepository } from './repositories/roles.repository';
import { RolesService } from './services/roles.service';
import { RolesController } from './controllers/roles.controller';

export class RolesModule {
    public rolesController: RolesController;
    public rolesService: RolesService;
    public rolesRepository: RolesRepository;

    constructor(db: PostgresDatabase, logger: Logger) {
        this.rolesRepository = new RolesRepository(db);
        this.rolesService = new RolesService(this.rolesRepository, logger);
        this.rolesController = new RolesController(this.rolesService);
    }
}
