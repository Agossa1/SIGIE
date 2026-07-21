import { UpdateTeamController } from './update-team.controller';
import { UpdateTeamService } from '../services/update-team.service';
import { TeamMapper } from '../mappers/team.mapper';
import { Request, Response } from 'express';
import { ZodError } from 'zod';

describe('UpdateTeamController', () => {
    let controller: UpdateTeamController;
    let mockService: jest.Mocked<UpdateTeamService>;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        mockService = { execute: jest.fn() } as any;
        controller = new UpdateTeamController(mockService);
        
        mockRes = {
            json: jest.fn().mockReturnThis()
        };
        
        next = jest.fn();
    });

    it('doit valider et mettre à jour une brigade avec un statut valide (active)', async () => {
        const mockTeam = { id: 'uuid-1', name: 'Brigade A', status: 'active', created_at: new Date('2023-01-01T00:00:00.000Z') };
        mockService.execute.mockResolvedValue(mockTeam as any);

        mockReq = {
            params: { id: 'uuid-1' },
            body: { status: 'active' }
        } as any;

        await controller.handle(mockReq as Request, mockRes as Response, next);

        expect(mockService.execute).toHaveBeenCalledWith('uuid-1', { status: 'active' });
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: TeamMapper.toDTO(mockTeam as any)
        }));
    });

    it('doit valider et mettre à jour une brigade avec un statut valide (suspended)', async () => {
        const mockTeam = { id: 'uuid-1', name: 'Brigade A', status: 'suspended' };
        mockService.execute.mockResolvedValue(mockTeam as any);

        mockReq = {
            params: { id: 'uuid-1' },
            body: { status: 'suspended' }
        } as any;

        await controller.handle(mockReq as Request, mockRes as Response, next);

        expect(mockService.execute).toHaveBeenCalledWith('uuid-1', { status: 'suspended' });
    });

    it('doit échouer à la validation si le statut est invalide (ex: "inactive")', async () => {
        mockReq = {
            params: { id: 'uuid-1' },
            body: { status: 'inactive' } // Invalide selon le schéma Zod (attend active, suspended ou disabled)
        } as any;

        await controller.handle(mockReq as Request, mockRes as Response, next);

        // Vérifie que l'erreur est bien passée au middleware de gestion d'erreurs (ZodError)
        expect(next).toHaveBeenCalledWith(expect.any(ZodError));
        
        const error = next.mock.calls[0][0] as ZodError;
        expect(error.issues[0].path).toContain('status');
        
        // Le service ne doit jamais être appelé si la validation échoue
        expect(mockService.execute).not.toHaveBeenCalled();
    });
});