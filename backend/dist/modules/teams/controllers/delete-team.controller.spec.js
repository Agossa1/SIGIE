"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const delete_team_controller_1 = require("./delete-team.controller");
describe('DeleteTeamController', () => {
    let controller;
    let mockService;
    let mockReq;
    let mockRes;
    let next;
    beforeEach(() => {
        mockService = { execute: jest.fn() };
        controller = new delete_team_controller_1.DeleteTeamController(mockService);
        mockRes = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });
    it('doit appeler le service avec l\'ID correct et retourner un succès', async () => {
        const teamId = '550e8400-e29b-41d4-a716-446655440000';
        mockReq = {
            params: { id: teamId }
        };
        await controller.handle(mockReq, mockRes, next);
        expect(mockService.execute).toHaveBeenCalledWith(teamId);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: true,
            message: 'Brigade supprimée avec succès'
        });
    });
    it('doit appeler next avec l\'erreur si le service échoue', async () => {
        const error = new Error('Database error');
        mockService.execute.mockRejectedValue(error);
        mockReq = {
            params: { id: 'any-uuid' }
        };
        await controller.handle(mockReq, mockRes, next);
        expect(next).toHaveBeenCalledWith(error);
        expect(mockRes.json).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=delete-team.controller.spec.js.map