"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const update_team_controller_1 = require("./update-team.controller");
const team_mapper_1 = require("../mappers/team.mapper");
const zod_1 = require("zod");
describe('UpdateTeamController', () => {
    let controller;
    let mockService;
    let mockReq;
    let mockRes;
    let next;
    beforeEach(() => {
        mockService = { execute: jest.fn() };
        controller = new update_team_controller_1.UpdateTeamController(mockService);
        mockRes = {
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });
    it('doit valider et mettre à jour une brigade avec un statut valide (active)', async () => {
        const mockTeam = { id: 'uuid-1', name: 'Brigade A', status: 'active', created_at: new Date('2023-01-01T00:00:00.000Z') };
        mockService.execute.mockResolvedValue(mockTeam);
        mockReq = {
            params: { id: 'uuid-1' },
            body: { status: 'active' }
        };
        await controller.handle(mockReq, mockRes, next);
        expect(mockService.execute).toHaveBeenCalledWith('uuid-1', { status: 'active' });
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: team_mapper_1.TeamMapper.toDTO(mockTeam)
        }));
    });
    it('doit valider et mettre à jour une brigade avec un statut valide (suspended)', async () => {
        const mockTeam = { id: 'uuid-1', name: 'Brigade A', status: 'suspended' };
        mockService.execute.mockResolvedValue(mockTeam);
        mockReq = {
            params: { id: 'uuid-1' },
            body: { status: 'suspended' }
        };
        await controller.handle(mockReq, mockRes, next);
        expect(mockService.execute).toHaveBeenCalledWith('uuid-1', { status: 'suspended' });
    });
    it('doit échouer à la validation si le statut est invalide (ex: "inactive")', async () => {
        mockReq = {
            params: { id: 'uuid-1' },
            body: { status: 'inactive' } // Invalide selon le schéma Zod (attend active, suspended ou disabled)
        };
        await controller.handle(mockReq, mockRes, next);
        // Vérifie que l'erreur est bien passée au middleware de gestion d'erreurs (ZodError)
        expect(next).toHaveBeenCalledWith(expect.any(zod_1.ZodError));
        const error = next.mock.calls[0][0];
        expect(error.issues[0].path).toContain('status');
        // Le service ne doit jamais être appelé si la validation échoue
        expect(mockService.execute).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=update-team.controller.spec.js.map