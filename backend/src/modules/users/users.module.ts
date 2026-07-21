import PostgresDatabase from '../../infra/database/postgres';
import type { Logger } from 'winston';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';

export class UsersModule {
    public usersController: UsersController;

    constructor(db: PostgresDatabase, logger: Logger) {
        const usersRepository = new UsersRepository(db, logger);
        const usersService = new UsersService(usersRepository, logger);
        this.usersController = new UsersController(usersService);
    }
}
