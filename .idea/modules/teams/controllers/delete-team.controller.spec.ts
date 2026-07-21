import { DeleteTeamController } from './delete-team.controller';
import { DeleteTeamService } from '../services/delete-team.service';
import { Request, Response } from 'express';

describe('DeleteTeamController', () => {
    let controller: DeleteTeamController;
    let mockService: jest.Mocked<DeleteTeamService>;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        mockService = { execute: jest.fn() } as any;
        controller = new DeleteTeamController(mockService);
        
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
        } as any;

        await controller.handle(mockReq as Request, mockRes as Response, next);

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
        } as any;

        await controller.handle(mockReq as Request, mockRes as Response, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(mockRes.json).not.toHaveBeenCalled();
    });
});