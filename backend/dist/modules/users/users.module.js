"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const users_repository_1 = require("./repositories/users.repository");
const users_service_1 = require("./services/users.service");
const users_controller_1 = require("./controllers/users.controller");
class UsersModule {
    constructor(db, logger) {
        const usersRepository = new users_repository_1.UsersRepository(db, logger);
        const usersService = new users_service_1.UsersService(usersRepository, logger);
        this.usersController = new users_controller_1.UsersController(usersService);
    }
}
exports.UsersModule = UsersModule;
//# sourceMappingURL=users.module.js.map