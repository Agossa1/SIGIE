"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transfer_agent_service_1 = require("./transfer-agent.service");
const appErrors_1 = require("../../../shared/errors/appErrors");
describe('TransferAgentService', () => {
    let service;
    let mockRepo;
    let mockLogger;
    beforeEach(() => {
        mockRepo = {
            transferMember: jest.fn(),
        };
        mockLogger = { info: jest.fn() };
        service = new transfer_agent_service_1.TransferAgentService(mockRepo, mockLogger);
    });
    it('doit lever une erreur si l\'équipe source et destination sont identiques', async () => {
        const data = {
            user_id: 'user-1',
            old_team_id: 'team-A',
            new_team_id: 'team-A',
            transferred_by: 'admin-1',
            created_at: new Date(),
            id: 'trans-1'
        };
        await expect(service.execute(data)).rejects.toThrow(appErrors_1.BadRequestError);
        expect(mockRepo.transferMember).not.toHaveBeenCalled();
    });
    it('doit appeler le repository pour un transfert valide', async () => {
        const data = {
            user_id: 'user-1',
            old_team_id: 'team-A',
            new_team_id: 'team-B',
            transferred_by: 'admin-1',
            created_at: new Date(),
            id: 'trans-1'
        };
        await service.execute(data);
        expect(mockRepo.transferMember).toHaveBeenCalledWith(data);
        expect(mockLogger.info).toHaveBeenCalled();
    });
});
//# sourceMappingURL=transfer-agent.service.spec.js.map