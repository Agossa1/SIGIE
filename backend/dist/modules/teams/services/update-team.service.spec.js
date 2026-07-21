"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const update_team_service_1 = require("./update-team.service");
describe('UpdateTeamService', () => {
    let service;
    let mockRepo;
    let mockLogger;
    beforeEach(() => {
        mockRepo = { updateTeam: jest.fn() };
        mockLogger = { info: jest.fn() };
        service = new update_team_service_1.UpdateTeamService(mockRepo, mockLogger);
    });
    it('doit appeler le repository avec les données partielles', async () => {
        const id = 'uuid-1';
        const updateData = { name: 'Nouveau Nom' };
        const mockResult = { id, ...updateData };
        mockRepo.updateTeam.mockResolvedValue(mockResult);
        const result = await service.execute(id, updateData);
        expect(mockRepo.updateTeam).toHaveBeenCalledWith(id, updateData);
        expect(result).toEqual(mockResult);
    });
});
//# sourceMappingURL=update-team.service.spec.js.map