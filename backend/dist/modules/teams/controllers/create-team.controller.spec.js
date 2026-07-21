"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_team_controller_1 = require("./create-team.controller");
const team_mapper_1 = require("../mappers/team.mapper");
describe('CreateTeamController', () => {
    let controller;
    let mockService;
    let mockReq;
    let mockRes;
    let next;
    beforeEach(() => {
        mockService = { execute: jest.fn() };
        controller = new create_team_controller_1.CreateTeamController(mockService);
        mockReq = {
            body: { name: 'Brigade Test' },
            user: { organizationId: 'org-123' }
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });
    it('should call service with validated data and return 201', async () => {
        const mockTeam = { id: '1', name: 'Brigade Test', created_at: new Date('2023-01-01T00:00:00.000Z') };
        mockService.execute.mockResolvedValue(mockTeam);
        await controller.handle(mockReq, mockRes, next);
        expect(mockService.execute).toHaveBeenCalledWith({
            name: 'Brigade Test',
            orgId: 'org-123'
        });
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: team_mapper_1.TeamMapper.toDTO(mockTeam)
        }));
    });
    it('should call next with error if validation fails', async () => {
        mockReq.body = { name: 'Ab' }; // Trop court pour le schéma Zod
        await controller.handle(mockReq, mockRes, next);
        expect(next).toHaveBeenCalled();
        expect(mockService.execute).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=create-team.controller.spec.js.map