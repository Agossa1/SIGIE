import { CreateTeamController } from './create-team.controller';
import { CreateNewBrigadeService } from '../services/create-new-brigade.service';
import { TeamMapper } from '../mappers/team.mapper';
import { Request, Response } from 'express';

describe('CreateTeamController', () => {
    let controller: CreateTeamController;
    let mockService: jest.Mocked<CreateNewBrigadeService>;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        mockService = { execute: jest.fn() } as any;
        controller = new CreateTeamController(mockService);
        
        mockReq = {
            body: { name: 'Brigade Test' },
            user: { organizationId: 'org-123' }
        } as any;

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        
        next = jest.fn();
    });

    it('should call service with validated data and return 201', async () => {
        const mockTeam = { id: '1', name: 'Brigade Test', created_at: new Date('2023-01-01T00:00:00.000Z') };
        mockService.execute.mockResolvedValue(mockTeam as any);

        await controller.handle(mockReq as Request, mockRes as Response, next);

        expect(mockService.execute).toHaveBeenCalledWith({
            name: 'Brigade Test',
            orgId: 'org-123'
        });
        expect(mockRes.status).toHaveBeenCalledWith(201);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            data: TeamMapper.toDTO(mockTeam as any)
        }));
    });

    it('should call next with error if validation fails', async () => {
        mockReq.body = { name: 'Ab' }; // Trop court pour le schéma Zod

        await controller.handle(mockReq as Request, mockRes as Response, next);

        expect(next).toHaveBeenCalled();
        expect(mockService.execute).not.toHaveBeenCalled();
    });
});