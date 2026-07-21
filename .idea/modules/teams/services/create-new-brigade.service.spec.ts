import { CreateNewBrigadeService } from './create-new-brigade.service';
import { TeamRepository } from '../repositories/team.repository';
import { Logger } from 'winston';
import { BadRequestError } from '../../../../apps/backend/src/shared/errors/appErrors';

describe('CreateNewBrigadeService', () => {
    let service: CreateNewBrigadeService;
    let mockRepo: jest.Mocked<TeamRepository>;
    let mockLogger: jest.Mocked<Logger>;

    beforeEach(() => {
        mockRepo = {
            createTeam: jest.fn(),
            addMember: jest.fn(),
        } as any;
        mockLogger = { info: jest.fn() } as any;
        service = new CreateNewBrigadeService(mockRepo, mockLogger);
    });

    it('should throw BadRequestError if name is too short', async () => {
        const data = { name: 'Ab', orgId: 'org-1' };
        await expect(service.execute(data)).rejects.toThrow(BadRequestError);
        expect(mockRepo.createTeam).not.toHaveBeenCalled();
    });

    it('should create a team and assign a supervisor if provided', async () => {
        const data = {
            name: 'Brigade Cotonou',
            orgId: 'org-1',
            supervisorId: 'user-sup'
        };
        
        const mockTeam = { id: 'team-uuid', name: data.name } as any;
        mockRepo.createTeam.mockResolvedValue(mockTeam);

        const result = await service.execute(data);

        expect(mockRepo.createTeam).toHaveBeenCalledWith({
            name: data.name,
            organizationId: data.orgId,
            municipalityId: undefined,
            teamType: undefined
        });
        expect(mockRepo.addMember).toHaveBeenCalledWith(
            mockTeam.id,
            data.supervisorId,
            'supervisor'
        );
        expect(result).toEqual(mockTeam);
    });
});