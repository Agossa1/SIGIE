import { TransferAgentService } from './transfer-agent.service';
import { TeamRepository } from '../repositories/team.repository';
import { Logger } from 'winston';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';

describe('TransferAgentService', () => {
    let service: TransferAgentService;
    let mockRepo: jest.Mocked<TeamRepository>;
    let mockLogger: jest.Mocked<Logger>;

    beforeEach(() => {
        mockRepo = {
            transferMember: jest.fn(),
        } as any;
        mockLogger = { info: jest.fn() } as any;
        service = new TransferAgentService(mockRepo, mockLogger);
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

        await expect(service.execute(data)).rejects.toThrow(BadRequestError);
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