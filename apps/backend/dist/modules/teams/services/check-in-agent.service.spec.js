"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const check_in_agent_service_1 = require("./check-in-agent.service");
const appErrors_1 = require("../../../shared/errors/appErrors");
describe('CheckInAgentService', () => {
    let service;
    let mockRepo;
    let mockLogger;
    beforeEach(() => {
        mockRepo = {
            logAttendance: jest.fn(),
        };
        mockLogger = { info: jest.fn() };
        service = new check_in_agent_service_1.CheckInAgentService(mockRepo, mockLogger);
    });
    it('doit lever une erreur si les coordonnées sont hors limites (Bénin ~6°N, 2°E)', async () => {
        const data = { userId: 'u1', teamId: 't1', latitude: 100, longitude: 2.4 };
        await expect(service.execute(data)).rejects.toThrow(appErrors_1.BadRequestError);
    });
    it('doit enregistrer le pointage pour des coordonnées valides', async () => {
        const data = {
            userId: 'u1',
            teamId: 't1',
            latitude: 6.367, // Cotonou
            longitude: 2.425
        };
        await service.execute(data);
        expect(mockRepo.logAttendance).toHaveBeenCalledWith({
            user_id: 'u1',
            team_id: 't1',
            latitude: 6.367,
            longitude: 2.425
        });
    });
});
//# sourceMappingURL=check-in-agent.service.spec.js.map