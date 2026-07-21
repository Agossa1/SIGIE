import type { Logger } from 'winston';
import { UsersRepository } from '../repositories/users.repository';

export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly logger: Logger
    ) {}

    async getAllUsers() {
        this.logger.info('Fetching all users');
        return await this.usersRepository.findAll();
    }

    async getUserById(id: string) {
        this.logger.info(`Fetching user by id: ${id}`);
        return await this.usersRepository.findById(id);
    }

    async updateProfile(id: string, data: { firstName?: string; lastName?: string; phone?: string }) {
        this.logger.info(`Updating profile for user: ${id}`);
        return await this.usersRepository.update(id, data);
    }

    async assignRole(userId: string, roleName: string) {
        this.logger.info(`Assigning role "${roleName}" to user "${userId}"`);
        const updated = await this.usersRepository.assignRole(userId, roleName);
        if (!updated) {
            throw new Error('Utilisateur introuvable après mise à jour');
        }
        return updated;
    }
}
