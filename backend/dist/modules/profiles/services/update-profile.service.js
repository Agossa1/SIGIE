"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileService = void 0;
class UpdateProfileService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(userId, data) {
        return this.repository.upsertProfile(userId, data);
    }
}
exports.UpdateProfileService = UpdateProfileService;
//# sourceMappingURL=update-profile.service.js.map