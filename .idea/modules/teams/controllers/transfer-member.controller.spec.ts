import { TransferMemberController } from './transfer-member.controller';
import { TransferAgentService } from '../services/transfer-agent.service';
import { Request, Response } from 'express';

describe('TransferMemberController', () => {
    let controller: TransferMemberController;
    let mockService: jest.Mocked<TransferAgentService>;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let next: jest.Mock;

    beforeEach(() => {
        mockService = { execute: jest.fn() } as any;
        controller = new TransferMemberController(mockService);
        
        mockReq = {
            body: {
                user_id: '550e8400-e29b-41d4-a716-446655440000',
                old_team_id: '550e8400-e29b-41d4-a716-446655440001',
                new_team_id: '550e8400-e29b-41d4-a716-446655440002',
                reason: 'Besoin renfort'
            },
            user: { id: 'admin-uuid' }
        } as any;

        mockRes = {
            json: jest.fn().mockReturnThis()
        };
        
        next = jest.fn();
    });

    it('doit retourner un succès après exécution du service', async () => {
        await controller.handle(mockReq as Request, mockRes as Response, next);

        expect(mockService.execute).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Agent transféré avec succès'
        }));
    });

    it('doit échouer si les UUID ne sont pas valides', async () => {
        mockReq.body.user_id = 'invalid-uuid';

        await controller.handle(mockReq as Request, mockRes as Response, next);

        expect(next).toHaveBeenCalled(); // ZodError passée au middleware
    });
});