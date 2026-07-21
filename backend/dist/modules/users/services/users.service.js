"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
class UsersService {
    constructor(usersRepository, logger) {
        this.usersRepository = usersRepository;
        this.logger = logger;
    }
    async getAllUsers() {
        this.logger.info('Fetching all users');
        return await this.usersRepository.findAll();
    }
    async getUserById(id) {
        this.logger.info(`Fetching user by id: ${id}`);
        return await this.usersRepository.findById(id);
    }
    async updateProfile(id, data) {
        this.logger.info(`Updating profile for user: ${id}`);
        return await this.usersRepository.update(id, data);
    }
    async assignRole(userId, roleName) {
        this.logger.info(`Assigning role "${roleName}" to user "${userId}"`);
        const updated = await this.usersRepository.assignRole(userId, roleName);
        if (!updated) {
            throw new Error('Utilisateur introuvable après mise à jour');
        }
        return updated;
    }
}
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map