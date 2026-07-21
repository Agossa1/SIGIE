import { RolesRepository } from '../repositories/roles.repository';
import { Logger } from 'winston';

export class RolesService {
    constructor(
        private readonly rolesRepository: RolesRepository,
        private readonly logger: Logger
    ) {}

    async getAllRoles() {
        this.logger.info('Fetching all roles from DB');
        return await this.rolesRepository.findAll();
    }

    async updateRole(id: string, data: Partial<import('../types/roles.types').RoleRecord>) {
        this.logger.info(`Updating role ${id}`);
        return await this.rolesRepository.update(id, data);
    }
}
