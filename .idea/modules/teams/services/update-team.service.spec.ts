import { UpdateTeamService } from './update-team.service';
import { TeamRepository } from '../repositories/team.repository';
import { Logger } from 'winston';

describe('UpdateTeamService', () => {
    let service: UpdateTeamService;
    let mockRepo: jest.Mocked<TeamRepository>;
    let mockLogger: jest.Mocked<Logger>;

    beforeEach(() => {
        mockRepo = { updateTeam: jest.fn() } as any;
        mockLogger = { info: jest.fn() } as any;
        service = new UpdateTeamService(mockRepo, mockLogger);
    });

    it('doit appeler le repository avec les données partielles', async () => {
        const id = 'uuid-1';
        const updateData = { name: 'Nouveau Nom' };
        const mockResult = { id, ...updateData } as any;
        
        mockRepo.updateTeam.mockResolvedValue(mockResult);

        const result = await service.execute(id, updateData);

        expect(mockRepo.updateTeam).toHaveBeenCalledWith(id, updateData);
        expect(result).toEqual(mockResult);
    });
});