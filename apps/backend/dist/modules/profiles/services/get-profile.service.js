"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProfileService = void 0;
class GetProfileService {
    constructor(repository) {
        this.repository = repository;
    }
    async execute(userId) {
        return this.repository.getProfile(userId);
    }
}
exports.GetProfileService = GetProfileService;
//# sourceMappingURL=get-profile.service.js.map