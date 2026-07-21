"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_new_brigade_service_1 = require("./create-new-brigade.service");
const appErrors_1 = require("../../../shared/errors/appErrors");
describe('CreateNewBrigadeService', () => {
    let service;
    let mockRepo;
    let mockLogger;
    beforeEach(() => {
        mockRepo = {
            createTeam: jest.fn(),
            addMember: jest.fn(),
        };
        mockLogger = { info: jest.fn() };
        service = new create_new_brigade_service_1.CreateNewBrigadeService(mockRepo, mockLogger);
    });
    it('should throw BadRequestError if name is too short', async () => {
        const data = { name: 'Ab', orgId: 'org-1' };
        await expect(service.execute(data)).rejects.toThrow(appErrors_1.BadRequestError);
        expect(mockRepo.createTeam).not.toHaveBeenCalled();
    });
    it('should create a team and assign a supervisor if provided', async () => {
        const data = {
            name: 'Brigade Cotonou',
            orgId: 'org-1',
            supervisorId: 'user-sup'
        };
        const mockTeam = { id: 'team-uuid', name: data.name };
        mockRepo.createTeam.mockResolvedValue(mockTeam);
        const result = await service.execute(data);
        expect(mockRepo.createTeam).toHaveBeenCalledWith({
            name: data.name,
            organizationId: data.orgId,
            municipalityId: undefined,
            teamType: undefined
        });
        expect(mockRepo.addMember).toHaveBeenCalledWith(mockTeam.id, data.supervisorId, 'supervisor');
        expect(result).toEqual(mockTeam);
    });
});
//# sourceMappingURL=create-new-brigade.service.spec.js.map