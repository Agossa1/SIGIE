"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const transfer_member_controller_1 = require("./transfer-member.controller");
describe('TransferMemberController', () => {
    let controller;
    let mockService;
    let mockReq;
    let mockRes;
    let next;
    beforeEach(() => {
        mockService = { execute: jest.fn() };
        controller = new transfer_member_controller_1.TransferMemberController(mockService);
        mockReq = {
            body: {
                user_id: '550e8400-e29b-41d4-a716-446655440000',
                old_team_id: '550e8400-e29b-41d4-a716-446655440001',
                new_team_id: '550e8400-e29b-41d4-a716-446655440002',
                reason: 'Besoin renfort'
            },
            user: { id: 'admin-uuid' }
        };
        mockRes = {
            json: jest.fn().mockReturnThis()
        };
        next = jest.fn();
    });
    it('doit retourner un succès après exécution du service', async () => {
        await controller.handle(mockReq, mockRes, next);
        expect(mockService.execute).toHaveBeenCalled();
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            success: true,
            message: 'Agent transféré avec succès'
        }));
    });
    it('doit échouer si les UUID ne sont pas valides', async () => {
        mockReq.body.user_id = 'invalid-uuid';
        await controller.handle(mockReq, mockRes, next);
        expect(next).toHaveBeenCalled(); // ZodError passée au middleware
    });
});
//# sourceMappingURL=transfer-member.controller.spec.js.map